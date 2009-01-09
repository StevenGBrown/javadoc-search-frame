var javadocsearchframeScriptMetadata = <><![CDATA[
// ==UserScript==
// @name          Javadoc Search Frame
// @namespace     http://userscripts.org/users/46156
// @description   Incremental search frame for Javadoc packages and classes.
// @homepage      http://code.google.com/p/javadoc-search-frame
// @version       9th January 2009
// @include       */allclasses-frame.html
// ==/UserScript==
]]></>.toString();

/**
LICENSING

This script is distributed under the MIT licence.
http://en.wikipedia.org/wiki/MIT_License

Copyright (c) 2009 Steven G. Brown

The initial (24th February 2008) release was a fork of the Javadoc
Incremental Search user script version 0.5 available at
http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html
Copyright (c) 2006 KOSEKI Kengo

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/


(function () {

/*
 * ----------------------------------------------------------------------------
 * GLOBAL VARIABLES
 * ----------------------------------------------------------------------------
 */

/**
 * Access key that will focus on the search field when activated ('s').
 * To activate in Mozilla Firefox 2.0 or later press Alt+Shift+S.
 */
var SEARCH_ACCESS_KEY = 's';

/**
 * Access key that will focus on the search field when activated ('s').
 * To activate in Mozilla Firefox 2.0 or later press Alt+Shift+A.
 */
var ERASE_ACCESS_KEY = 'a';

/**
 * Placeholder values that can be entered into the class_menu or package_menu
 * settings and will, when the menu is opened, be replaced with data relevant
 * to the current package or class.
 */
var MENU_REPLACEMENT = {
    CLASS_NAME: function (classLink) { 
        return classLink.getClassName();
    },

    PACKAGE_NAME: function (classLink) { 
        return classLink.getPackageName();
    },

    PACKAGE_PATH: function (classLink) { 
        return classLink.getPackageName().replace(/\./g, '/');
    },

    ANCHOR_NAME: function (classLink, anchorLink) {
        if (!anchorLink) {
            return '';
        }
        return anchorLink.getNameWithoutParameter();
    }
};

/**
 * An associative array containing the metadata block properties of this script.
 */
var SCRIPT_META_DATA = function () {
    var metadataAsObject = {};
    var metadataAsString = javadocsearchframeScriptMetadata;
    var lines = metadataAsString.split(/[\r\n]+/).filter(/\/\/ @/);
    metadataAsObject.include = [];
    metadataAsObject.exclude = [];
    for each (var line in lines) {
        var result = line.match(/\/\/ @(\S+)\s*(.*)/);
        var name = result[1];
        var value = result[2];
        if (metadataAsObject[name] instanceof Array) {
           metadataAsObject[name].push(value);
        } else {
            metadataAsObject[name] = value;
        }
    }
    return metadataAsObject;
}();

/**
 * Types used to classify links found in the package list or class list frames.
 */
var LINKTYPE = {
    PACKAGE : 'package',
    INTERFACE : 'interface',
    CLASS : 'class',
    ENUM : 'enum',
    EXCEPTION : 'exception',
    ERROR : 'error',
    ANNOTATION : 'annotation'
};

/**
 * An array of link types in the order they will be displayed in the search
 * list.
 */
var LINKTYPES = [ LINKTYPE.PACKAGE, LINKTYPE.INTERFACE, LINKTYPE.CLASS,
        LINKTYPE.ENUM, LINKTYPE.EXCEPTION, LINKTYPE.ERROR, LINKTYPE.ANNOTATION ];


var ALL_CLASS_LINKS = [];
var CURRENT_CLASS_LINKS = [];
var TOP_CLASS_LINK = null;
var TOP_ANCHOR_LINK = null;
var LAST_AUTO_OPEN_URL = null;
var PREVIOUS_CLASS_LINKS_QUERY = null;


/*
 * ----------------------------------------------------------------------------
 * STOPWATCH
 * ----------------------------------------------------------------------------
 */

/**
 * Create a new StopWatch.
 * @class Used to measure elapsed time.
 */
StopWatch = function () {
    this.startTimeInMillisecondsSinceEpoch = new Date().getTime();
    this.isStopped = false;
};

/**
 * Stop this stopwatch.
 */
StopWatch.prototype.stop = function () {
    this.stopTimeElapsedInMilliseconds = new Date().getTime() - this.startTimeInMillisecondsSinceEpoch;
    this.isStopped = true;
};

/**
 * Get the time period that has elapsed since this stopwatch object was
 * created.
 * If the stop method has been called, this function returns the time period
 * that has elapsed between creation of the object and calling the stop method.
 */
StopWatch.prototype.timeElapsed = function () {
    var timeElapsedInMilliseconds;
    if (this.isStopped) {
        timeElapsedInMilliseconds = this.stopTimeElapsedInMilliseconds;
    } else {
        timeElapsedInMilliseconds = new Date().getTime() - this.startTimeInMillisecondsSinceEpoch;
    }
    return timeElapsedInMilliseconds + 'ms';
};


/*
 * ----------------------------------------------------------------------------
 * LOGGING
 * ----------------------------------------------------------------------------
 */

/**
 * @class Error Console logging utility.
 */
Log = {
    enabled : false,

    gmLogAvailable : function () {
        try {
            return GM_log;
        } catch (ex) {
            return false;
        }
    }()
};

/**
 * Enable logging.
 * Before this function is called, the {@link Log#message} function will have no
 * effect.
 */
Log.enable = function () {
    this.enabled = true;
};

/**
 * Log the given object to the Error Console as a message.
 */
Log.message = function (logMessage) {
    if (!this.enabled) {
        return;
    }

    if (this.gmLogAvailable) {
        // Greasemonkey logging function.
        GM_log(logMessage);
    } else {
        // Firebug or Google Chrome logging function.
        console.log(logMessage);
    }
};


/*
 * ----------------------------------------------------------------------------
 * UNIT TEST SUITE
 * ----------------------------------------------------------------------------
 */

/**
 * @class Unit test suite used by this script.
 */
UnitTestSuite = {
    unitTestFunctions : []
};

/**
 * Add a test function to this suite.
 * @param {String} functionUnderTest the name of the function under test
 * @param {Function} unitTestFunction the test function
 */
UnitTestSuite.testFunctionFor = function (functionUnderTest, unitTestFunction) {
    this.unitTestFunctions.push({name : functionUnderTest, run : unitTestFunction});
};

/**
 * Run all of the test functions that have been added to this suite.
 * @returns {UnitTestResult} the result of running this suite
 */
UnitTestSuite.run = function () {
    var resultsByFunctionUnderTest = [];

    var iteration = function (unitTestFunction) {
        this.results = [];
        try {
            unitTestFunction.run();
        } catch (ex) {
            this.results.push({
                success:false,
                description:description,
                actual:actual,
                expected:expected,
                exception:ex});
        }
        resultsByFunctionUnderTest.push({
            functionUnderTest:unitTestFunction.name,
            results:this.results});
    };

    this.unitTestFunctions.forEach(iteration, this);
    return new UnitTestResult(resultsByFunctionUnderTest);
};

/**
 * Assert that the actual value equals the expected value.
 * 
 * @param description a description of the assertion
 * @param actual the actual value
 * @param expected the expected value
 */
UnitTestSuite.assertThat = function (description, actual, expected) {
    var result = {
        success:UnitTestSuite._equals(expected, actual),
        description:description,
        actual:actual,
        expected:expected,
        exception:null};
    UnitTestSuite.results.push(result);
};

/**
 * Assert that eval() of the actual value equals the expected value.
 * The advantage of using this function over {@link UnitTestSuite.assertThat} is
 * the description does not need to be supplied, since the actualToEval
 * parameter is used as a description.
 * 
 * @param {String} actualToEval evaluated (with the eval() method) to determine the actual value
 * @param expected the expected value
 */
UnitTestSuite.assertThatEval = function (actualToEval, expected) {
    var description = actualToEval;
    var actual = eval(actualToEval);
    UnitTestSuite.assertThat(description, actual, expected);
};

/**
 * Has no effect; intended to make calls to the {@link UnitTestSuite.assertThat}
 * and {@link UnitTestSuite.assertThatEval} functions more readable.
 * @returns the value paramter (unchanged)
 * @example assertThat(theSky, is(blue));
 */
UnitTestSuite.is = function (value) {
    return value;
};

/**
 * Used by the {@link UnitTestSuite} assertion functions to determine if two
 * objects are equal.
 * @returns {Boolean} true if the two objects are equal, false otherwise
 * @private
 */
UnitTestSuite._equals = function (one, two) {
    if (one instanceof Array && two instanceof Array) {
        var equalsFunction = arguments.callee;
        return one.every(function (oneItem, index) {
            var twoItem = two[index];
            return equalsFunction(oneItem, twoItem);
        });
    }
    if (one === undefined) {
        return two === undefined;
    }
    if (one === null) {
        return two === null;
    }
    return one === two || (one.equals && one.equals(two));
};


/**#@+
 * Function declared in the global scope as a convenience for test functions;
 * calls through to a function of the same name declared on the
 * {@link UnitTestSuite} object.
 */

/**
 * @function
 */
var assertThat = UnitTestSuite.assertThat;

/**
 * @function
 */
var assertThatEval = UnitTestSuite.assertThatEval;

/**
 * @function
 */
var is = UnitTestSuite.is;

/**#@-
 */


/**
 * Create a new UnitTestResult.
 * @class Unit test result; returned by {@link UnitTestSuite#run}.
 */
UnitTestResult = function (resultsByFunctionUnderTest) {
    this.resultsByFunctionUnderTest = resultsByFunctionUnderTest;

    var results = [];
    this.resultsByFunctionUnderTest.forEach(function (resultForAFunctionUnderTest) {
        results = results.concat(resultForAFunctionUnderTest.results);
    });

    this.numberOfAssertions = results.length;
    this.numberOfFailedAssertions = results.filter(function (result) {
        return !result.success;
    }).length;
    this.exceptionThrown = results.some(function (result) {
        return result.exception;
    });
};

/**
 * @returns the total number of assertions made by the unit test
 */
UnitTestResult.prototype.getNumberOfAssertions = function () {
    return this.numberOfAssertions;
};

/**
 * @returns the number of failed assertions made by the unit test
 */
UnitTestResult.prototype.getNumberOfFailedAssertions = function () {
    return this.numberOfFailedAssertions;
};

/**
 * @returns true if an exception was thrown during execution of the unit test,
 * false otherwise
 */
UnitTestResult.prototype.wasExceptionThrown = function () {
    this.exceptionThrown;
};

/**
 * Determine if the unit test failed.
 * @returns {Boolean} true if at least one assertion failed, false otherwise
 */
UnitTestResult.prototype.failed = function () {
    return this.getNumberOfFailedAssertions() > 0;
};

/**
 * Get detailed results of running the unit test.
 * @returns {Array} the detailed results of running the unit test
 */
UnitTestResult.prototype.getResultsByFunctionUnderTest = function () {
    return this.resultsByFunctionUnderTest;
};


/*
 * ----------------------------------------------------------------------------
 * USER PREFERENCES
 * ----------------------------------------------------------------------------
 */

/**
 * Create a new UserPreference.
 * @class Provides persistent configuration of the script settings.
 * @param key the key associated with this user preference
 * @param defaultValue the default value used when the value cannot be
 *                     retrieved or has not yet been configured
 */
function UserPreference(key, defaultValue) {
    this.key = key;
    this.defaultValue = defaultValue;
}

/**
 * @returns {Boolean} true if user preference values can be retrieved, false otherwise
 */
UserPreference.canGet = function () {
    try {
        return Boolean(GM_getValue);
    } catch (ex) {
        return false;
    }
};

/**
 * @returns {Boolean} true if user preference values can be set, false otherwise
 */
UserPreference.canSet = function () {
    try {
        return Boolean(GM_setValue);
    } catch (ex) {
        return false;
    }
};

/**
 * @returns {Boolean} true if user preferences can be both retrieved and set,
 *                    false otherwise
 */
UserPreference.canGetAndSet = function () {
    return UserPreference.canGet() && UserPreference.canSet();
};

/**
 * @returns the key associated with this user preference
 */
UserPreference.prototype.getKey = function () {
    return this.key;
};

/**
 * @returns the value of this user preference. If the preference cannot be
 *          retrieved or has not yet been configured, the default value is
 *          returned
 * @see UserPreference.canGet
 */
UserPreference.prototype.getValue = function () {
    var value;
    if (UserPreference.canGet()) {
        value = GM_getValue(this.key);
    }
    if (value === undefined) {
        value = this.defaultValue;
    }
    return value;
};

/**
 * @returns the default value of this user preference
 */
UserPreference.prototype.getDefaultValue = function () {
    return this.defaultValue;
};

/**
 * Set this user preference to a new value.
 * @throws an exception if this user preference cannot be set
 * @see UserPreference.canSet
 */
UserPreference.prototype.setValue = function (newValue) {
    GM_setValue(this.key, newValue);
};


/**#@+
 * User preference recognised by this script.
 */

/**
 * @field
 */
UserPreference.AUTO_OPEN = new UserPreference('auto_open', false);

/**
 * @field
 */
UserPreference.PACKAGE_MENU = new UserPreference('package_menu',
        "<a href='http://www.koders.com/?s=##PACKAGE_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
        "<a href='http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n");

/**
 * @field
 */
UserPreference.CLASS_MENU = new UserPreference('class_menu',
        "<a href='http://www.koders.com/?s=##PACKAGE_NAME##+##CLASS_NAME##+##ANCHOR_NAME##' target='classFrame'>@1:search(koders)</a><br/>\n" +
        "<a href='http://www.docjar.com/s.jsp?q=##CLASS_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>\n" +
        "<a href='http://www.docjar.com/html/api/##PACKAGE_PATH##/##CLASS_NAME##.java.html' target='classFrame'>@3:source(Docjar)</a><br/>\n");

/**#@-
 */


/*
 * ----------------------------------------------------------------------------
 * INTERNAL WEB PAGES
 * ----------------------------------------------------------------------------
 */

/**
 * @class Namespace for storing the internal web pages of this script.
 */
WebPage = {};

/**
 * Settings page.
 */
WebPage.SETTINGS = {
    privateFunctions : {
        radioButton : function (args) {
            var radioButtonHTML = '<label>' +
                    '<input id="' + args.id + '" type=radio name="' + args.name + '" value="true"';
            if (args.isChecked) {
                radioButtonHTML += ' checked="true"';
            }
            if (args.isDisabled) {
                radioButtonHTML += ' disabled="true"';
            }
            radioButtonHTML += '/>' + args.text;
            if (args.isDefault) {
                radioButtonHTML += ' (Default)';
            }
            radioButtonHTML += '</label>';
            return radioButtonHTML;
        },

        booleanOption : function (preference, trueText, falseText) {
            var key = preference.getKey();
            var trueChecked = preference.getValue();
            var trueDefault = preference.getDefaultValue();

            var trueRadioButtonHTML = this.radioButton({
                    name : key, id : key + '_true', text : trueText,
                    isChecked : trueChecked, isDisabled : !UserPreference.canGetAndSet(), isDefault : trueDefault});
            var falseRadioButtonHTML = this.radioButton({
                    name : key, id : key + '_false', text : falseText,
                    isChecked : !trueChecked, isDisabled : !UserPreference.canGetAndSet(), isDefault : !trueDefault});

            return  '<p>\n' +
                    '<b>' + name + '</b><br/>\n' +
                    trueRadioButtonHTML + '<br/>\n' +
                    falseRadioButtonHTML + '<br/>\n' +
                    '</p>\n';
        },

        menuOption : function (preference, text) {
            var key = preference.getKey();
            var textAreaId = key + '_text_area';
            var restoreDefaultButtonId = key + '_restore_default_button';

            var textAreaHTML = '<textarea id="' + textAreaId + '" rows="5" cols="100" wrap="off"';
            if (!UserPreference.canGetAndSet()) {
                textAreaHTML += ' disabled="true"';
            }
            textAreaHTML += '>' + preference.getValue() + '</textarea>';

            return  '<p>\n' +
                    '<b>' + key + '</b><br/>\n' +
                    textAreaHTML + '<br/>\n' +
                    '<input id="' + restoreDefaultButtonId + '" type=button value="Restore Default"/><br/>\n' +
                    text + '\n' +
                    '</p>\n';
        },

        getInstructions : function () {
            var instructions = '<p>\n';
            if (UserPreference.canGetAndSet()) {
                instructions += 'Changes to these preferences will take effect the next time a ' +
                                'Javadoc page in opened in your browser. Alternatively, refresh ' +
                                'a currently open Javadoc page to have these preferences take ' +
                                'effect immediately.\n';
            } else {
                instructions +=
                        '<font color=RED>\n' +
                        'Settings cannot be configured. Please upgrade to the latest version of Greasemonkey.\n' +
                        '</font>\n';
            }
            instructions += '</p>\n';
            return instructions;
        },

        registerBooleanOptionEventListeners : function (pageDocument, preference) {
            var key = preference.getKey();
            var trueRadioButton = pageDocument.getElementById(key + '_true');
            var falseRadioButton = pageDocument.getElementById(key + '_false');

            var clickEventListener = function () {
                preference.setValue(trueRadioButton.checked);
            };

            trueRadioButton.addEventListener('click', clickEventListener, false);
            falseRadioButton.addEventListener('click', clickEventListener, false);
        },

        registerMenuOptionEventListeners : function (pageDocument, preference) {
            var key = preference.getKey();

            var textAreaId = key + '_text_area';
            var textAreaElement = pageDocument.getElementById(textAreaId);
            textAreaElement.addEventListener('keyup', function () {
                preference.setValue(textAreaElement.value);
            }, false);

            var restoreDefaultButtonId = key + '_restore_default_button';
            var restoreDefaultButton = pageDocument.getElementById(restoreDefaultButtonId);
            restoreDefaultButton.addEventListener('click', function () {
                textAreaElement.value = preference.getDefaultValue();preference.setValue(preference.getDefaultValue());
            }, false);
        }
    },

    title : 'Settings',

    getContents : function () {
        var instructions = this.privateFunctions.getInstructions();
        var autoOpenHTML = this.privateFunctions.booleanOption(UserPreference.AUTO_OPEN,
                'Automatically open the first package or class in the list after each search.',
                'Wait for the Enter key to be pressed');
        var classMenuHTML = this.privateFunctions.menuOption(UserPreference.CLASS_MENU,
                'Menu displayed when pressing the \'@\' key if a class is currently displayed ' +
                'at the top of the search list.');
        var packageMenuHTML = this.privateFunctions.menuOption(UserPreference.PACKAGE_MENU,
                'Menu displayed when pressing the \'@\' key if a package is currently displayed ' +
                'at the top of the search list.');
        return instructions + autoOpenHTML + classMenuHTML + packageMenuHTML;
    },

    registerEventListeners : function (pageDocument) {
        this.privateFunctions.registerBooleanOptionEventListeners(pageDocument, UserPreference.AUTO_OPEN);
        this.privateFunctions.registerMenuOptionEventListeners(pageDocument, UserPreference.CLASS_MENU);
        this.privateFunctions.registerMenuOptionEventListeners(pageDocument, UserPreference.PACKAGE_MENU);
    },

    open : function () {
        WebPage._open(this);
    }
};

/**
 * Unit test results page.
 */
WebPage.UNIT_TEST_RESULTS = {
    privateFunctions : {
        toString : function (obj) {
            if (obj === undefined) {
                return 'undefined';
            }
            if (obj === null) {
                return 'null';
            }
            var str;
            if (obj instanceof Array) {
                str = obj.join('');
            } else if (obj instanceof String || typeof(obj) ==='string') {
                str = "'" + obj + "'";
            } else {
                str = obj.toString();
            }
            str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;br\/&gt;/g, '&lt;br/&gt;<br/>');
            return str;
        },

        getSummary : function (unitTestResult) {
            var failedAssertions = unitTestResult.getNumberOfFailedAssertions();
            var totalAssertions = unitTestResult.getNumberOfAssertions();

            var summary = navigator.userAgent + '<br/>\n';
            if (unitTestResult.wasExceptionThrown()) {
                summary += '<font color=red>\nUnit test failed.\n</font>\n';
            } else if (unitTestResult.failed()) {
                summary += '<font color=red>\n' + failedAssertions + ' assertion failure' +
                           (failedAssertions === 1 ? '' : 's') +
                           ' (' + totalAssertions + ' assertions in total).\n</font>\n';
            } else {
                summary += '<font color=lime>\nAll ' + totalAssertions + ' assertions passed.\n</font>\n';
            }
            summary += '<hr/>\n';
            return summary;
        },

        getResult : function (result) {
            if (result.exception) {
                return '<p><b>Exception:</b></p>\n' +
                       '<p>' + ex + '</p>\n';
            } else {
                return '<p><b>' + result.description + '</b></p>' +
                       '<p>expected</p><p>' + this.toString(result.expected) + '</p>' +
                       '<p>but was</p><p>' + this.toString(result.actual) + '</p>\n';
            }
        },

        getResultsForFunctionUnderTest : function (functionUnderTest, results) {
            var failure = results.some(function (result) {
                return !result.success;
            });
            var resultsText = '';
            if (failure) {
                resultsText += '<h2>' + functionUnderTest + '</h2>\n';
                results.forEach(function (result) {
                    if (!result.success) {
                        resultsText += this.getResult(result);
                    }
                }, this);
                resultsText += '<hr/>\n';
            }
            return resultsText;
        }
    },

    title : 'Unit Test Results',

    getContents : function () {
        var unitTestResult = UnitTestSuite.run();
        var resultsText = '';
        resultsText += this.privateFunctions.getSummary(unitTestResult);

        var resultsByFunctionUnderTest = unitTestResult.getResultsByFunctionUnderTest();
        resultsByFunctionUnderTest.forEach(function (resultForFunctionUnderTest) {
            resultsText += this.privateFunctions.getResultsForFunctionUnderTest(
                    resultForFunctionUnderTest.functionUnderTest, resultForFunctionUnderTest.results);
        }, this);

        return resultsText;
    },

    open : function () {
        WebPage._open(this);
    }
};

/**
 * Open the given page.
 * @private
 */
WebPage._open = function (page) {
    var pageBodyInnerHTML = '';
    pageBodyInnerHTML +=
            '<h1>' + SCRIPT_META_DATA.name + '</h1>\n' +
            '<p>\n' +
            'This version released: ' + SCRIPT_META_DATA.version + '<br/>\n' +
            '<a href="' + SCRIPT_META_DATA.homepage + '">' + SCRIPT_META_DATA.homepage + '</a>\n' +
            '</p>\n' +
            '<hr/>\n' +
            '<p><h2>' + page.title + '</h2></p>\n' +
            '<hr/>\n';

    pageBodyInnerHTML += page.getContents();

    var classFrame = top.frames[2];
    var pageDocument = classFrame.document;
    pageDocument.body.innerHTML = pageBodyInnerHTML;

    if (page.registerEventListeners) {
        page.registerEventListeners(pageDocument);
    }
};


/*
 * ----------------------------------------------------------------------------
 * QUERY
 * ----------------------------------------------------------------------------
 */

/**
 * @class Query (undocumented).
 */
Query = {
    mode : 1,
    modeChanged : false,
    search : '',
    lastClassSearch : '',
    lastAnchorSearch : ''
};

Query.CLASS_MODE = 1;
Query.ANCHOR_MODE = 2;
Query.MENU_MODE = 3;

Query.isClassMode = function () {
    return this.mode === Query.CLASS_MODE;
};

Query.isAnchorMode = function () {
    return this.mode === Query.ANCHOR_MODE;
};

Query.isMenuMode = function () {
    return this.mode === Query.MENU_MODE;
};

Query.getSearchString = function () {
    return this.search;
};

Query.isModeChanged = function () {
    return this.modeChanged;
};

Query.isAnchorSearchStarted = function () {
    if (this.isAnchorMode()) {
        return (0 < this.searchString.length);
    } else if (this.isMenuMode()) {
        return (1 < this.lastAnchorSearch.length); // lastAnchorSearch starts with '#'
    }
    return false;
};

Query.createCondition = function () {
    if (this.search.length === 0 || this.search === '*') {
        return function (link) {
            return true;
        };
    }

    var pattern = this.getRegex();

    return function (link) {
        return link.matches(pattern);
    };
};

Query.getRegex = function () {
    var pattern = '^';

    for (i = 0; i < this.search.length; i++) {
        var character = this.search.charAt(i);
        if (/[A-Z]/.test(character) && i > 0) {
            // An uppercase character which is not at the beginning of the
            // search input string. Perform a case-insensitive match of this
            // character. If the matched character is uppercase, allow any
            // number of lowercase characters to be matched before it. This
            // allows for Camel Case searching.

            // The \.? term allows a Camel Case search to match an inner class.

            pattern += '(([a-z]*\.?' + character + ')|' + character.toLowerCase() + ')';
        } else if (/[a-zA-Z]/.test(character)) {
            // A lowercase character, or an uppercase character at the
            // beginning of the search input string. Perform a case-insensitive
            // match of this character.

            pattern += '(' + character.toUpperCase() + '|' + character.toLowerCase() + ')';
        } else if (character === '*') {
            // Replace '*' with '.*' to allow the asterisk to be used as a wildcard.

            pattern += '.*';
        } else if (character in ['\\', '^', '$', '+', '?', '.', '(', ':', '!', '|', '{', ',', '[']) {
           // A special regular expression character. Escape this character.

           pattern += '\\' + character;
        } else {

            pattern += character;
        }
    }

    pattern += '.*';
    return new RegExp(pattern);
};

Query.input = function (input) {
    var lastMode = this.mode;
    input = this._shiftMode(input);
    this.modeChanged  = (lastMode !== this.mode);
    this.search = this._getSearchStringFromInput(input);
};

Query.update = function (input) {
    View.setFieldValue(input);
    this.input(input);
};

Query.erase = function () {
    if (this.isAnchorMode() && 0 < this.search.length) {
        this.update('#');
    } else {
        this.update('');
    }
};

Query._getSearchStringFromInput = function (input) {
    if (this.isMenuMode()) {
        if (input.length <= 1) {
            return '';
        } else {
            return input.substring(1, 2);
        }
    } else if (this.isAnchorMode()) {
        if (0 < input.lastIndexOf('#')) {
            View.setFieldValue('#');
            return '';
        } else {
            input = input.substring(1);
            return this._normalize(input);
        }
    } else if (this.isClassMode()) {
        return this._normalize(input);
    } else {
        return '';
    }
};

Query._normalize = function (input) {
    input = this._concatStars(input);
    input = this._removeLastStar(input);
    return input;
};

Query._shiftMode = function (input) {
    var lastSearch;
    if (input.indexOf('@') !== -1) {
        if (this.isMenuMode()) {
            return input;
        }
        // * -> menuMode
        lastSearch = input.replace(/@/g, '');
        this._memoryLastSearch(lastSearch);
        View.setFieldValue('@');
        this.mode = Query.MENU_MODE;
        return '@';
    } else if (input.indexOf('#') !== -1) {
        if (this.isAnchorMode()) {
            return input;
        }
        // * -> anchorMode
        lastSearch = input.replace(/#/g, '');
        this._memoryLastSearch(lastSearch);
        View.setFieldValue('#');
        this.mode = Query.ANCHOR_MODE;
        return '#';
    } else if (this.isMenuMode() && this.lastAnchorSearch !== '') {
        // menuMode -> anchorMode
        View.setFieldValue(this.lastAnchorSearch);
        input = this.lastAnchorSearch;
        this.lastAnchorSearch = '';
        this.mode = Query.ANCHOR_MODE;
        return input;
    } else if (! this.isClassMode()) {
        // * -> classMode
        View.setFieldValue(this.lastClassSearch);
        input = this.lastClassSearch;
        this.lastAnchorSearch = '';
        this.lastClassSearch = '';
        this.mode = Query.CLASS_MODE;
        return input;
    }
    return input;
};

Query._memoryLastSearch = function (lastSearch) {
    if (this.isClassMode()) {
        this.lastClassSearch = lastSearch;
        this.lastAnchorSearch = '';
        this.search = '';
    } else if (this.isAnchorMode()) {
        this.lastAnchorSearch = lastSearch;
        this.search = '';
    }
};

Query._removeLastStar = function (s) {
    if (s.lastIndexOf('*') === s.length - 1) {
        s = s.substring(0, s.length - 1);
    }
    return s;
};

Query._concatStars = function (s) {
    return s.replace(/\*+/, '*');
};


/*
 * ----------------------------------------------------------------------------
 * VIEW
 * ----------------------------------------------------------------------------
 */

/**
 * @class View (undocumented).
 */
View = {
    field : null,
    container : null,
    subContainer : null
};

View.getContainer = function () {
    return this.container;
};

View.getSubContainer = function () {
    return this.subContainer;
};

View.setFieldValue = function (v) {
    this.field.value = v;
};

View.getFieldValue = function () {
    return this.field.value;
};

View.getFieldElement = function () {
    return this.field;
};

View.focusField = function () {
    if (this.field) {
        this.field.focus();
    }
};

View.selectClass = function (classLink) {
    var node = this.container.createContentNode();
    
    node.innerHTML = classLink.getHTML();
    node.appendChild(this.subContainer.getParent());
    this.container.setContentNode(node);
};

View.initSearchField = function () {
  var node = this._getHeadingNode();
  if (!node) {
    return;
  }

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }

  this.field = this._createSearchField();
  node.appendChild(this.field);

  var eraseButton = this._createEraseButton();
  node.appendChild(eraseButton);

  node.appendChild(document.createElement('br'));

  var settingsLink = this._createSettingsLink();
  node.appendChild(settingsLink);
};

View.warnOfFailedUnitTest = function () {
    var node = this._getHeadingNode();
    if (!node) {
        return;
    }

    var unitTestFailedWarning = this._createUnitTestFailedWarning();
    node.appendChild(document.createElement('p'));
    node.appendChild(unitTestFailedWarning);
};

View.initContainer = function () {
    var xpathResult = document.evaluate('//font[@class="FrameItemFont"]',
            document, null, XPathResult.ANY_TYPE, null);
    var node = xpathResult.iterateNext();
    if (!node) {
        return false;
    }
    this.container = new Container(node);

    node = this._createSubContainerNode();
    this.subContainer = new Container(node);
};

View._getHeadingNode = function () {
    var xpathResult = document.evaluate('//font[@class="FrameHeadingFont"]/b',
            document, null, XPathResult.ANY_TYPE, null);
    return xpathResult.iterateNext();
};

View._createSearchField = function () {
    var s = document.createElement('input');
    s.setAttribute('type', 'text');
    s.addEventListener('keyup', searchFieldKeyup, false);
    s.addEventListener('onchange', searchFieldChanged, false);
    s.addEventListener('focus', searchFieldFocus, false);
    if (SEARCH_ACCESS_KEY) {
        s.setAttribute('accesskey', SEARCH_ACCESS_KEY);
    }
    return s;
};

View._createEraseButton = function () {
    var iconErase = 'data:image/gif;base64,R0lGODlhDQANAJEDAM%2FPz%2F%2F%2F%2F93d3UpihSH5BAEAAAMALAAAAAANAA0AAAIwnCegcpcg4nIw2sRGDZYnBAWiIHJQRZbec5XXEqnrmXIupMWdZGCXlAGhJg0h7lAAADs%3D';

    var e = document.createElement('input');
    e.setAttribute('type', 'image');
    e.setAttribute('src', iconErase);
    e.setAttribute('style', 'margin-left: 2px');
    e.addEventListener('click', eraseButtonClick, false);
    if (ERASE_ACCESS_KEY) {
        e.setAttribute('accesskey', ERASE_ACCESS_KEY);
    }
    return e;
};

View._createSettingsLink = function () {
  var anchorElement = document.createElement('a');
  anchorElement.setAttribute('href', 'javascript:void(0);');
  anchorElement.appendChild(document.createTextNode(WebPage.SETTINGS.title));
  anchorElement.addEventListener('click', function (event) {
      WebPage.SETTINGS.open();
      event.preventDefault();
  }, false);
  var fontElement = document.createElement('font');
  fontElement.setAttribute('size', '-2');
  fontElement.appendChild(anchorElement);
  return fontElement;
};

View._createUnitTestFailedWarning = function () {
  var anchorElement = document.createElement('a');
  anchorElement.setAttribute('href', 'javascript:void(0);');
  anchorElement.appendChild(document.createTextNode('Unit test failed. Click here for details.'));
  anchorElement.addEventListener('click', function (event) {
      WebPage.UNIT_TEST_RESULTS.open();
      event.preventDefault();
  }, false);
  var fontElement = document.createElement('font');
  fontElement.setAttribute('size', '-2');
  fontElement.appendChild(anchorElement);
  var italicElement = document.createElement('i');
  italicElement.appendChild(fontElement);
  return italicElement;
};

View._createSubContainerNode = function () {
    var parent = document.createElement('span');
    var node = document.createElement('ul');
    node.setAttribute('style', 'list-style-type:none; padding:0');
    parent.appendChild(node);
    return node;
};


/*
 * ----------------------------------------------------------------------------
 * CONTAINER
 * ----------------------------------------------------------------------------
 */

/**
 * @class Container (undocumented).
 */
Container = function (masterNode) {
    this.parent = masterNode.parentNode;
    this.master = masterNode;
    this.current = null;
};

Container.prototype.createContentNode = function () {
    return this.master.cloneNode(false);
};

Container.prototype.setContentNode = function (node) {
    if (this.parent.hasChildNodes()) {
        this.parent.replaceChild(node, this.parent.firstChild);
    } else {
        this.parent.appendChild(node);
    }
    this.current = node;
};

Container.prototype.getNode = function () {
    return this.current;
};

Container.prototype.getParent = function () {
    return this.parent;
};

Container.prototype.print = function (msg) {
    var node = document.createTextNode(msg);
    this.setContentNode(node);
};


/*
 * ----------------------------------------------------------------------------
 * SUPPORTING CLASSES: PACKAGES AND CLASSES SEARCH
 * ----------------------------------------------------------------------------
 */

function parseURL(anchorElementHTML) {
    var rx = /href\s*=\s*(?:"|')([^"']+)(?:"|')/;
    var matches;
    if ((matches = rx.exec(anchorElementHTML)) !== null) {
        var relativeURL = matches[1];
        var windowURL = location.href;
        var absoluteURL = windowURL.substring(0, windowURL.lastIndexOf('/') + 1) + relativeURL;
        return absoluteURL;
    }
    return null;
}


/**
 * @class HeaderLink (undocumented).
 */
HeaderLink = function (type) {
    var header;
    if (type === LINKTYPE.CLASS) {
        header = 'Classes';
    } else if (type === LINKTYPE.ANNOTATION) {
        header = 'Annotation Types';
    } else {
        header = type.charAt(0).toUpperCase() + type.substring(1) + 's';
    }

    this.html = '<br/><b>' + header + '</b>';
};

HeaderLink.prototype.matches = function (regex) {
    return true;
};

HeaderLink.prototype.getHTML = function () {
    return this.html;
};

HeaderLink.prototype.equals = function (obj) {
    if (obj instanceof HeaderLink) {
        return this.html === obj.html;
    }
    return false;
};

HeaderLink.prototype.toString = function () {
    return this.html;
};


/**
 * @class PackageLink (undocumented).
 */
PackageLink = function (packageName, html) {
    this.packageName = packageName;
    this.html = html;
    this.url = null;
};

PackageLink.prototype.matches = function (regex) {
    return regex.test(this.packageName);
};

PackageLink.prototype.getHTML = function () {
    return this.html;
};

PackageLink.prototype.getPackageName = function () {
    return this.packageName;
};

PackageLink.prototype.getUrl = function () {
    if (!this.url) {
        this.url = parseURL(this.html);
    }
    return this.url;
};

PackageLink.prototype.equals = function (obj) {
    if (obj instanceof PackageLink) {
        return this.packageName === obj.packageName && this.html === obj.html;
    }
    return false;
};

PackageLink.prototype.toString = function () {
    return this.html + ' (' + this.packageName + ')';
};


/**
 * @class ClassLink (undocumented).
 */
ClassLink = function (packageName, className, html) {
    this.className = className;
    this.html = html;
    this.url = null;
    this.canonicalName = packageName + '.' + className;
};

ClassLink.prototype.matches = function (regex) {
    return regex.test(this.className) || regex.test(this.canonicalName);
};

ClassLink.prototype.getHTML = function () {
    return this.html;
};

ClassLink.prototype.getClassName = function () {
    return this.className;
};

ClassLink.prototype.getPackageName = function () {
    return this.canonicalName.substring(0, this.canonicalName.length - this.className.length - 1);
};

ClassLink.prototype.getUrl = function () {
    if (!this.url) {
        this.url = parseURL(this.html);
    }
    return this.url;
};

ClassLink.prototype.equals = function (obj) {
    if (obj instanceof ClassLink) {
        return this.canonicalName === obj.canonicalName && this.html === obj.html;
    }
    return false;
};

ClassLink.prototype.toString = function () {
    return this.html + ' (' + this.canonicalName + ')';
};


/*
 * ----------------------------------------------------------------------------
 * SUPPORTING CLASSES: METHOD SEARCH
 * ----------------------------------------------------------------------------
 */

/**
 * @class AnchorsLoader (undocumented).
 */
AnchorsLoader = {};

AnchorsLoader.load = function (classLink) {
    if (AnchorsCache.contains(classLink)) {
        updateAnchors();
        return;
    }
    var handler = new AnchorsRequestHandler();
    try {
        var req = new XMLHttpRequest();
        req.open('GET', classLink.getUrl(), true);
        req.onreadystatechange = function () { 
            if (req.readyState === 2) {
                handler.loaded(req, classLink);
            } else if (req.readyState === 4 && req.responseText) { 
                handler.completed(req, classLink);
            }
        };
        req.send(null);
    } catch(e) {
        var p = {};
        p.method = 'GET';
        p.url = classLink.getUrl();
        p.onreadystatechange = function (res) {
            if (res.readyState === 2) {
                handler.loaded(res, classLink);
            } else if (res.readyState === 4 && res.responseText) { 
                handler.completed(res, classLink);
            }
        };
        GM_xmlhttpRequest(p);
    }
};


/**
 * @class AnchorsRequestHandler (undocumented).
 */
AnchorsRequestHandler = function () {
};

AnchorsRequestHandler.prototype.loaded = function (req, classLink) {
    View.getSubContainer().print('parsing...');
};

AnchorsRequestHandler.prototype.completed = function (req, classLink) {
    if (! Query.isAnchorMode() || classLink !== TOP_CLASS_LINK) {
        return;
    }
    var names = this._getAnchorNames(req.responseText);
    var nodes = this._createAnchorLinkArray(classLink.getUrl(), names);
    AnchorsCache.add(classLink, nodes);
    updateAnchors();
};

AnchorsRequestHandler.prototype._createAnchorLinkArray = function (baseurl, 
                                                                  names) {
    var nodes = [];
    var keywordNodes = [];
    var i;
    for (i = 0; i < names.length; i++) {
        var node = new AnchorLink(baseurl, names[i]);
        if (node.isKeyword()) {
            keywordNodes.push(node);
        } else {
            nodes.push(node);
        }
    }
    for (i = 0; i < keywordNodes.length; i++) {
        nodes.push(keywordNodes[i]);
    }
    return nodes;
};

AnchorsRequestHandler.prototype._getAnchorNames = function (doc) {
    var pat = /<A NAME=\"([^\"]+)\"/gi;
    var i = 0;
    var matches;
    var names = [];
    while ((matches = pat.exec(doc)) !== null) {
        names.push(matches[1]);
    }
    return names;
};


/**
 * @class AnchorLink (undocumented).
 */
AnchorLink = function (baseurl, name) {
    this.name = name;
    this.lowerName = name.toLowerCase();
    this.url = baseurl + '#' + name;
    this.keywordOrNot = this._getKeywordOrNot(name);
    this.html = this._getHtml(name, this.url, this.keywordOrNot);
};

AnchorLink.prototype.matches = function (regex) {
    return regex.test(this.name);
};

AnchorLink.prototype.getHTML = function () {
    return this.html;
};

AnchorLink.prototype.getLowerName = function () {
    return this.lowerName;
};

AnchorLink.prototype.getUrl = function () {
    return this.url;
};

AnchorLink.prototype.isKeyword = function () {
    return this.keywordOrNot;
};

AnchorLink.prototype.getNameWithoutParameter = function () {
    if (this.name.indexOf('(') !== -1) {
        return this.name.substring(0, this.name.indexOf('('));
    } else {
        return this.name;
    }
};

AnchorLink.keywords = {
    'navbar_top':1,
    'navbar_top_firstrow':1,
    'skip-navbar_top':1,
    'field_summary':1,
    'nested_class_summary':1,
    'constructor_summary':1,
    'constructor_detail':1,
    'method_summary':1,
    'method_detail':1,
    'field_detail':1,
    'navbar_bottom':1,
    'navbar_bottom_firstrow':1,
    'skip-navbar_bottom':1
};

AnchorLink.keywordPrefixes = [
    'methods_inherited_from_',
    'fields_inherited_from_',
    'nested_classes_inherited_from_'
];

AnchorLink.prototype._getKeywordOrNot = function (name) {
    if (AnchorLink.keywords[name] === 1) {
        return true;
    }
    var i;
    for (i = 0; i < AnchorLink.keywordPrefixes.length; i++) {
        if (name.indexOf(AnchorLink.keywordPrefixes[i]) === 0) {
            return true;
        }
    }
    return false;
};

AnchorLink.prototype._getHtml = function (name, url, keywordOrNot) {
    var html = '<li><a href="' + url + '" target="classFrame" class="anchorLink"';
    if (keywordOrNot) {
        html += ' style="color:#666"';
    }
    html += '>' + name + '</a></li>';
    return html;
};


/**
 * @class AnchorsCache (undocumented).
 */
AnchorsCache = {
    cache : []
};

AnchorsCache.add = function (classLink, anchors) {
    this.cache[classLink.getUrl()] = anchors;
};

AnchorsCache.contains = function (classLink) {
    return this.cache[classLink.getUrl()];
};

AnchorsCache.appendAnchors = function (parent, classLink, condition) {
    var anchorLinks = this.cache[classLink.getUrl()];
    if (!anchorLinks) {
        return;
    }
    
    TOP_ANCHOR_LINK = null;
    var html = '';
    var count = 0;
    var i;
    for (i = 0; i < anchorLinks.length; i++) {
        var al = anchorLinks[i];
        if (condition(al)) {
            count++;
            html += al.getHTML();
            if (!TOP_ANCHOR_LINK) {
                TOP_ANCHOR_LINK = al;
            }
        }
    }
    
    if (TOP_ANCHOR_LINK !== null && UserPreference.AUTO_OPEN.getValue() && ! Query.isModeChanged()) {
        var url = TOP_ANCHOR_LINK.getUrl();
        if (url !== LAST_AUTO_OPEN_URL) {
            LAST_AUTO_OPEN_URL = url;
            openInClassFrame(url);
        }
    }
    
    parent.innerHTML = html;
};


/*
 * ----------------------------------------------------------------------------
 * MAIN SCRIPT
 * ----------------------------------------------------------------------------
 */

/**
 * Entry point of this script; called when the script has loaded.
 */
function init() {
    var initStopWatch = new StopWatch();

    // Retrieve the innerHTML of the package and class frames.
    var retrieveInnerHtmlStopWatch = new StopWatch();
    var packagesInnerHTML = getPackagesInnerHtml();
    var classesInnerHTML = getClassesInnerHtml();
    retrieveInnerHtmlStopWatch.stop();

    // Initialise stored class links.
    var searchListStopWatch = new StopWatch();
    var packageLinks = getPackageLinks(packagesInnerHTML);
    var classLinks = getClassLinks(classesInnerHTML);
    ALL_CLASS_LINKS = packageLinks.concat(classLinks);
    if (ALL_CLASS_LINKS.length === 0) {
        return false;
    }
    searchListStopWatch.stop();

    // Initialise class frame.
    var initContainerStopWatch = new StopWatch();
    View.initContainer();
    var container = View.getContainer();
    if (!container) {
        return;
    }
    initContainerStopWatch.stop();

    // Perform an initial search. This will populate the class frame with the
    // entire list of packages and classes.
    var initialSearchStopWatch = new StopWatch();
    search();
    initialSearchStopWatch.stop();

    // Initialise the search field.
    var initSearchFieldStopWatch = new StopWatch();
    View.initSearchField();
    var searchField = View.getFieldElement();
    if (searchField) {
        watch(searchField, searchFieldChanged, 200);
    }
    initSearchFieldStopWatch.stop();

    // Run the unit test.
    var unitTestStopWatch = new StopWatch();
    var unitTestResults = UnitTestSuite.run();
    if (unitTestResults.failed()) {
        View.warnOfFailedUnitTest();
    }
    unitTestStopWatch.stop();

    // Hide the package list frame.
    var hidePackageFrameStopWatch = new StopWatch();
    var frameset = top.document.getElementsByTagName('frameset')[1];
    if (frameset) {
        frameset.setAttribute('rows', '0,*');
        frameset.setAttribute('border', 0);
        frameset.setAttribute('frameborder', 0);
        frameset.setAttribute('framespacing', 0);
        scroll(0, 0);
    }
    hidePackageFrameStopWatch.stop();

    // Give focus to the search field.
    var focusSearchFieldStopWatch = new StopWatch();
    View.focusField();
    focusSearchFieldStopWatch.stop();

    Log.enable();
    Log.message('\n' +
        'initialised in ' + initStopWatch.timeElapsed() + ' total\n' +
        '- contents of existing frames retrieved in ' + retrieveInnerHtmlStopWatch.timeElapsed() + '\n' +
        '- search list constructed in ' + searchListStopWatch.timeElapsed() + '\n' +
        '- container initialised in ' + initContainerStopWatch.timeElapsed() + '\n' +
        '- initial search performed in ' + initialSearchStopWatch.timeElapsed() + '\n' +
        '- search field initialised in ' + initSearchFieldStopWatch.timeElapsed() + '\n' +
        '- unit test run in ' + unitTestStopWatch.timeElapsed() + '\n' +
        '- package frame hidden in ' + hidePackageFrameStopWatch.timeElapsed() + '\n' +
        '- search field given focus in ' + focusSearchFieldStopWatch.timeElapsed()
    );
}

/**
 * Perform a search.
 */
function search() {
    if (Query.isMenuMode()) {
        if (Query.isModeChanged()) {
            showMenu();
        } else {
            selectMenu();
        }
    } else if (Query.isAnchorMode()) {
        if (Query.isModeChanged()) {
            loadAnchors();
        } else {
            selectAnchors();
        }
    } else {
        selectClasses();
    }
}

/**
 * @return the inner HTML of the body element of the package list frame, or undefined if the element does not exist
 */
function getPackagesInnerHtml() {
    var packageFrame = top.frames[0];
    var packagesInnerHTML;
    if (packageFrame && packageFrame.name === 'packageListFrame' && packageFrame.document && packageFrame.document.body) {
        packagesInnerHTML = packageFrame.document.body.innerHTML;
    }
    return packagesInnerHTML;
}

/**
 * Parse packages from the inner HTML of the body element of the packages list
 * frame.
 * 
 * Assumptions:
 * - Double-quotes are used to declare the target attribute.
 * 
 * @param packagesInnerHTML the inner HTML of the body element of the packages
 *                          list frame
 * @returns an array of {@PackageLink} objects
 */
function getPackageLinks(packagesInnerHTML) {
    if (!packagesInnerHTML) {
        return [];
    }

    var packageLinks = [];
    var html;
    var link;
    var matches;
    var packagesHeader;
    var packagesRegex = /<a[^>]+>([^<]+)<\/a\s*>/gi;

    while ((matches = packagesRegex.exec(packagesInnerHTML)) !== null) {
        if (matches[1] !== 'All Classes') {
            if (!packagesHeader) {
                packagesHeader = new HeaderLink(LINKTYPE.PACKAGE);
                packageLinks.push(packagesHeader);
            }
            html = matches[0]
                    .replace(/package-frame.html/gi, 'package-summary.html')
                    .replace(/target\s*=\s*"packageFrame"/gi, 'target="classFrame"');
            link = new PackageLink(matches[1], html);
            packageLinks.push(link);
        }
    }

    return packageLinks;
}

UnitTestSuite.testFunctionFor('getPackageLinks(packagesInnerHTML)', function () {

    var headerClassLink = new HeaderLink(LINKTYPE.PACKAGE);
    var packagePath = 'java/applet/';
    var package = 'java.applet';

    var lowerCaseHtml =
            '<a href="' + packagePath + 'package-frame.html" target="packageFrame">' + package + '</a>';
    var lowerCaseClassLink = new PackageLink(package,
            '<a href="' + packagePath + 'package-summary.html" target="classFrame">' + package + '</a>');
    assertThat('lowercase html tags',
            getPackageLinks(lowerCaseHtml), is([headerClassLink, lowerCaseClassLink]));

    var upperCaseHtml =
            '<A HREF="' + packagePath + 'package-frame.html" TARGET="packageFrame">' + package + '</A>';
    var upperCaseClassLink = new PackageLink(package,
            '<A HREF="' + packagePath + 'package-summary.html" target="classFrame">' + package + '</A>');
    assertThat('uppercase html tags',
            getPackageLinks(upperCaseHtml), is([headerClassLink, upperCaseClassLink]));

    var lowerCaseWithWhitespaceHtml =
            '<a   href  =  "' + packagePath + 'package-frame.html"   target  =  "packageFrame"  >' +
            package + '</a  >';
    var lowerCaseWithWhitespaceClassLink = new PackageLink(package,
            '<a   href  =  "' + packagePath + 'package-summary.html"   target="classFrame"  >' +
            package + '</a  >');
    assertThat('lowercase html tags with additional whitespace',
            getPackageLinks(lowerCaseWithWhitespaceHtml),
            is([headerClassLink, lowerCaseWithWhitespaceClassLink]));

    var upperCaseWithWhitespaceHtml =
            '<A   HREF  =  "' + packagePath + 'package-frame.html"   TARGET  =  "packageFrame"  >' +
            package + '</A  >';
    var upperCaseWithWhitespaceClassLink = new PackageLink(package,
            '<A   HREF  =  "' + packagePath + 'package-summary.html"   target="classFrame"  >' +
            package + '</A  >');
    assertThat('uppercase html tags with additional whitespace',
            getPackageLinks(upperCaseWithWhitespaceHtml),
            is([headerClassLink, upperCaseWithWhitespaceClassLink]));

    // Assert that the All Classes anchor is ignored when looking for packages.
    assertThat('"All Classes" is not a match (lowercase html tags)',
            getPackageLinks('<a href="allclasses-frame.html" target="packageFrame">All Classes</a>'),
            is([]));
    assertThat('"All Classes" is not a match (uppercase html tags)',
            getPackageLinks('<A HREF="allclasses-frame.html" TARGET="packageFrame">All Classes</A>'),
            is([]));
    assertThat('"All Classes" is not a match (lowercase html tags with additional whitespace)',
            getPackageLinks('<a   href  =  "allclasses-frame.html"   target="packageFrame"  >All Classes</a  >'),
            is([]));
    assertThat('"All Classes" is not a match (uppercase html tags with additional whitespace)',
            getPackageLinks('<A   HREF  =  "allclasses-frame.html"   target="packageFrame"  >All Classes</A  >'),
            is([]));
});

/**
 * @return the inner HTML of the body element of the classes list frame, or undefined if the element does not exist
 */
function getClassesInnerHtml() {
    var classesInnerHTML;
    if (document && document.body) {
        classesInnerHTML = document.body.innerHTML;
    }
    return classesInnerHTML;
}

/**
 * Parse interfaces, classes, enumerations, and annotations from the inner HTML
 * of the body element of the classes list frame.
 * 
 * Assumptions:
 * - The use of the title attribute is consistent: either all of the anchor
 *   elements on the page have it, or all of them do not have it.
 * - Double-quotes are used to declare the href or title attributes.
 * - The italic element is the only element that can be a child of the
 *   anchor element.
 * 
 * @param classesInnerHTML the inner HTML of the body element of the classes
 *                         list frame
 * @returns an array of {@HeaderLink} and {@link ClassLink} objects
 */
function getClassLinks(classesInnerHTML) {
    if (!classesInnerHTML) {
        return [];
    }

    var classLinks = [];
    var cl;
    var matches;

    var classLinksMap = {};
    LINKTYPES.forEach(function (type) {
        classLinksMap[type] = [];
    });

    function checkForExceptionOrErrorType(type, className) {
        if (type === LINKTYPE.CLASS) {
            if (endsWith(className, 'Exception')) {
                type = LINKTYPE.EXCEPTION;
            } else if (endsWith(className, 'Error')) {
                type = LINKTYPE.ERROR;
            }
        }
        return type;
    }

    var classesRegexWithTitle =
            /title\s*=\s*\"\s*([^\s]+)\s+in\s+([^\s\"]+)[^>]+>(?:\s*<i\s*>)?\s*([^<]+)(?:<\/i\s*>\s*)?<\/a\s*>/gi;
    var anchorWithTitleFound = false;
    while ((matches = classesRegexWithTitle.exec(classesInnerHTML)) !== null) {
        var entireMatch = classesInnerHTML.substring(
                classesInnerHTML.lastIndexOf('<a', classesRegexWithTitle.lastIndex), classesRegexWithTitle.lastIndex);
        var typeInTitle = matches[1];
        var packageName = matches[2];
        var className = rightTrim(matches[3]);

        cl = new ClassLink(
                packageName, className, entireMatch + ' [ ' + packageName + ' ]');
        var type = typeInTitle.toLowerCase();
        type = checkForExceptionOrErrorType(type, className);
        classLinksMap[type].push(cl);
        anchorWithTitleFound = true;
    }

    if (!anchorWithTitleFound) {
        var classesWithoutTitleRegex =
                /<a\s+href\s*=\s*\"([^\"]+)(?:\/|\\)[^\"]+\"[^>]*>(\s*<i\s*>)?\s*([^<]+)(?:<\/i\s*>\s*)?<\/a\s*>/gi;
        while ((matches = classesWithoutTitleRegex.exec(classesInnerHTML)) !== null) {
            var entireMatch = matches[0];
            var packageNameInHref = matches[1];
            var openingItalicTag = matches[2];
            var className = rightTrim(matches[3]);

            var packageName = packageNameInHref.replace(/\/|\\/g, '.');
            cl = new ClassLink(
                    packageName, className, entireMatch + ' [ ' + packageName + ' ]');
            var type = openingItalicTag ? LINKTYPE.INTERFACE : LINKTYPE.CLASS;
            type = checkForExceptionOrErrorType(type, className);
            classLinksMap[type].push(cl);
        }
    }

    LINKTYPES.forEach(function (type) {
        var classLinksUnderHeader = classLinksMap[type];
        if (classLinksUnderHeader.length > 0) {
            var headerClassLink = new HeaderLink(type);
            classLinks.push(headerClassLink);
            classLinks = classLinks.concat(classLinksUnderHeader);
        }
    });

    return classLinks;
}

UnitTestSuite.testFunctionFor('getClassLinks(classesInnerHTML)', function () {

    function assert(args, html, description) {
        var headerLink = new HeaderLink(args.type);
        var link = new ClassLink(args.package, args.class, html + ' [ ' + args.package + ' ]');
        assertThat(description, getClassLinks(html), is([headerLink, link]));
    }

    function runClassesHtmlTestCase(args, includeTitle) {
        if (!args.typeInTitle) {
            args.typeInTitle = args.type;
        }

        var descriptionPrefix = args.type + ' ' + (includeTitle ? 'with title' : 'without title') + ',' +
                (args.italic ? 'with italic tag' : 'without italic tag') + ': ';

        var lowerCaseHtml =
                '<a href="' + args.href + '"' +
                (includeTitle ? ' title="' + args.typeInTitle + ' in ' + args.package : '') +
                '" target="classFrame">' +
                (args.italic ? '<i>' + args.class + '</i>' : args.class) +
                '</a>';
        assert(args, lowerCaseHtml, descriptionPrefix + 'lowercase html tags');

        var upperCaseHtml =
                '<A HREF="' + args.href + '"' +
                (includeTitle ? ' TITLE="' + args.typeInTitle + ' IN ' + args.package : '') +
                '" TARGET="classFrame">' +
                (args.italic ? '<I>' + args.class + '</I>' : args.class) +
                '</A>';
        assert(args, upperCaseHtml, descriptionPrefix + 'uppercase html tags');

        var lowerCaseWithWhitespaceHtml =
                '<a   href  =   "' + args.href + '"' +
                (includeTitle ? '   title  =  "  ' + args.typeInTitle + '   in   ' + args.package : '') +
                '  "   target  =  "classFrame"  >  ' +
                (args.italic ? '<i  >  ' + args.class + '  </i  >' : args.class) +
                '   </a  >';
        assert(args, lowerCaseWithWhitespaceHtml, descriptionPrefix + 'lowercase html tags with additonal whitespace');

        var upperCaseWithWhitespaceHtml =
                '<A   HREF  =  "' + args.href + '"' +
                (includeTitle ? '   TITLE="' + args.typeInTitle +
                '   in   ' + args.package : '') +
                '   "   TARGET  =  "classFrame"  >  ' +
                (args.italic ? '<I  >  ' + args.class + '  </I  >' : args.class) +
                '   </A  >';
        assert(args, upperCaseWithWhitespaceHtml, descriptionPrefix + 'uppercase html tags with additional whitespace');
    }

    function runTitleTestCase(args) {
        runClassesHtmlTestCase(args, true);
    }

    function runTitleAndNoTitleTestCase(args) {
        runClassesHtmlTestCase(args, true);
        runClassesHtmlTestCase(args, false);
    }

    // Assert that classes are matched correctly. Classes can be matched with or without a title attribute.
    runTitleAndNoTitleTestCase( {
            href:'javax/swing/AbstractAction.html', type:LINKTYPE.CLASS,
            package:'javax.swing', class:'AbstractAction', italic:false} );

    // Assert that interfaces are matched correctly. Interfaces can be matched with or without a title attribute.
    // If an anchor has no title attribute, the contents of the anchor must in italics to be recognised as an interface.

    runTitleAndNoTitleTestCase( {
            href:'javax/swing/text/AbstractDocument.AttributeContext.html', type:LINKTYPE.INTERFACE,
            package:'javax.swing.text', class:'AbstractDocument.AttributeContext', italic:true} );
    runTitleTestCase( {
            href:'javax/swing/text/AbstractDocument.AttributeContext.html', type:LINKTYPE.INTERFACE,
            package:'javax.swing.text', class:'AbstractDocument.AttributeContext', italic:false} );

    // Assert that enumerations are matched correctly.
    // Anchors must have a title attribute to be recognised as an enumeration.
    runTitleTestCase( {
            href:'java/net/Authenticator.RequestorType.html', type:LINKTYPE.ENUM,
            package:'java.net', class:'Authenticator.RequestorType', italic:false} );

    // Assert that exceptions are matched correctly. Exceptions can be matched with or without a title attribute.
    runTitleAndNoTitleTestCase( {
            href:'java/security/AccessControlException.html', type:LINKTYPE.EXCEPTION,
            typeInTitle:'class', package:'java.security', class:'AccessControlException', italic:false} );

    // Assert that errors are matched correctly. Errors can be matched with or without a title attribute.
    runTitleAndNoTitleTestCase( {
            href:'java/lang/AbstractMethodError.html', type:LINKTYPE.ERROR,
            typeInTitle:'class', package:'java.lang', class:'AbstractMethodError', italic:false} );

    // Assert that annotations are matched correctly. Anchors must have a title attribute to be recognised as an annotation.
    runTitleTestCase( {
            href:'javax/xml/ws/Action.html', type:LINKTYPE.ANNOTATION,
            package:'javax.xml.ws', class:'Action', italic:false} );
});

/**
 * Get the first link found in the given array of links, ignoring {@link HeaderLink} objects.
 */
function getTopClassLink(classLinks) {
  var i;
  var link;
  for (i = 0; i < classLinks.length; i++) {
    link = classLinks[i];
    if (!(link instanceof HeaderLink)) {
      return link;
    }
  }
  return null;
}

UnitTestSuite.testFunctionFor('getTopClassLink(classLinks)', function () {

    var headerLinkOne = new HeaderLink(LINKTYPE.PACKAGE);
    var headerLinkTwo = new HeaderLink(LINKTYPE.CLASS);
    var classLinkOne = new ClassLink('java.lang', 'Object', 'java/lang/Object');
    var classLinkTwo = new ClassLink('java.awt', 'Component', 'java/awt/Component');

    function assertThatGetTopClassLink(functionInput, expected) {
        var description = 'getTopClassLink(' + functionInput + ')';
        var actual = getTopClassLink(functionInput);
        assertThat(description, actual, expected);
    }

    assertThatGetTopClassLink([], is(null));
    assertThatGetTopClassLink([headerLinkOne], is(null));
    assertThatGetTopClassLink([headerLinkOne, classLinkOne], is(classLinkOne));
    assertThatGetTopClassLink([headerLinkOne, classLinkOne, classLinkTwo], is(classLinkOne));
    assertThatGetTopClassLink([headerLinkOne, headerLinkTwo, classLinkOne], is(classLinkOne));
    assertThatGetTopClassLink([headerLinkOne, headerLinkTwo, classLinkOne, classLinkTwo], is(classLinkOne));
    assertThatGetTopClassLink([classLinkOne, headerLinkOne], is(classLinkOne));
});

function selectClasses() {
    if (PREVIOUS_CLASS_LINKS_QUERY && PREVIOUS_CLASS_LINKS_QUERY === Query.getSearchString()) {
        return;
    }

    var stopWatch = new StopWatch();

    var container = View.getContainer();
    var node = container.createContentNode();
    var condition = Query.createCondition();
    appendClasses(condition, node);
    container.setContentNode(node);

    Log.message('\n' +
        '\'' + Query.getSearchString() + '\' in ' + stopWatch.timeElapsed() + '\n' +
        Query.getRegex()
    );

    if (TOP_CLASS_LINK && UserPreference.AUTO_OPEN.getValue()) {
        var url = TOP_CLASS_LINK.getUrl();
        if (url !== LAST_AUTO_OPEN_URL) {
            LAST_AUTO_OPEN_URL = url;
            openInClassFrame(url);
        }
    }

    PREVIOUS_CLASS_LINKS_QUERY = Query.getSearchString();
}

function appendClasses(condition, parent) {
    if (PREVIOUS_CLASS_LINKS_QUERY && Query.getSearchString().indexOf(PREVIOUS_CLASS_LINKS_QUERY) === 0) {
        // Characters have been added to the end of the previous query. Start
        // with the current search list and filter out any links that do not match.

    } else {
        // Otherwise, start with the complete search list.

        CURRENT_CLASS_LINKS = ALL_CLASS_LINKS.concat();
    }

    CURRENT_CLASS_LINKS = CURRENT_CLASS_LINKS.filter(condition);
    TOP_CLASS_LINK = getTopClassLink(CURRENT_CLASS_LINKS);

    var html = '';
    CURRENT_CLASS_LINKS.forEach(function (cl) {
        html += cl.getHTML();
        html += '<br/>';
    });
    parent.innerHTML = html;
}

function loadAnchors() {
    if (TOP_CLASS_LINK) {
      View.selectClass(TOP_CLASS_LINK);
      View.getSubContainer().print('loading...');
      AnchorsLoader.load(TOP_CLASS_LINK);
    }
}

function selectAnchors() {
    if (!TOP_CLASS_LINK || !AnchorsCache.contains(TOP_CLASS_LINK)) {
        return;
    }
    PREVIOUS_CLASS_LINKS_QUERY = null;
    var condition = Query.createCondition();
    var container = View.getSubContainer();
    var node = container.createContentNode();
    AnchorsCache.appendAnchors(node, TOP_CLASS_LINK, condition);
    container.setContentNode(node);
}

function updateAnchors() {
    if (Query.isAnchorMode()) {
        selectAnchors(Query.getSearchString());
    }
}

function openInNewTab(url) {
    window.open(url);
}

function openInClassFrame(url) {
    if (window.parent.frames[2]) {
        window.parent.frames[2].location.href = url;
        return true;
    }
}

function showMenu() {
    if (!TOP_CLASS_LINK) {
      return;
    }
    View.selectClass(TOP_CLASS_LINK);
    var container = View.getSubContainer();
    var node = container.createContentNode();
    var content;
    if (TOP_CLASS_LINK instanceof PackageLink) {
        content = UserPreference.PACKAGE_MENU.getValue();
    } else {
        content = UserPreference.CLASS_MENU.getValue();
    }
    var rx = /##(\w+)##/;
    var matches;
    while ((matches = rx.exec(content)) !== null) {
        var f = MENU_REPLACEMENT[matches[1]];
        var rx2 = new RegExp(matches[0], 'g');
        if (!f) {
            content = content.replace(rx2, '');
        } else {
            var anchorLink = null;
            if (Query.isAnchorSearchStarted()) {
                anchorLink = TOP_ANCHOR_LINK;
            }
            content = content.replace(rx2, f(TOP_CLASS_LINK, anchorLink));
        }
    }
    node.innerHTML = content;
    container.setContentNode(node);
}

function selectMenu() {
    if (!Query.getSearchString()) {
        return;
    }

    var node = View.getSubContainer().getNode();
    var xpathResult = document.evaluate('//a', node, null, 
                                        XPathResult.ANY_TYPE, null);
    var node;
    while ((node = xpathResult.iterateNext()) !== null) {
        var textNode = node.firstChild;
        if (textNode
            && textNode.nodeType === 3 /* Node.TEXT_NODE */
            && textNode.nodeValue.indexOf('@' + Query.getSearchString()) === 0) {
            openMenu(node);
            Query.input('');
            search();
            return;
        }
    }
    Query.update('@');
}

function openMenu(node) {
    var href = node.getAttribute('href');
    openInClassFrame(href);
}

function watch(element, callback, msec) {
    var elementChanged = false;
    var old = element.value;
    setInterval(function () {
        var q = element.value;
        if (elementChanged && old === q) {
            elementChanged = false;
            callback(q);
        } else if (old !== q) {
            elementChanged = true;
        }
        old = q;
    }, msec)
}

function endsWith(stringOne, stringTwo) {
    var strIndex = stringOne.length - stringTwo.length;
    return strIndex >= 0 && stringOne.substring(strIndex) === stringTwo;
}

UnitTestSuite.testFunctionFor('endsWith(stringOne, stringTwo)', function () {

    assertThatEval("endsWith('one', 'onetwo')", is(false));
    assertThatEval("endsWith('one', 'one')", is(true));
    assertThatEval("endsWith('one', 'e')", is(true));
    assertThatEval("endsWith('', 'two')", is(false));
});

function rightTrim(stringToTrim) {
    return stringToTrim.replace(/\s+$/, '');
}

UnitTestSuite.testFunctionFor('rightTrim(stringToTrim)', function () {

    assertThatEval("rightTrim('string')", is('string'));
    assertThatEval("rightTrim('string   ')", is('string'));
    assertThatEval("rightTrim('   string')", is('   string'));
    assertThatEval("rightTrim('   string   ')", is('   string'));
});


/*
 * event handlers
 */

function searchFieldKeyup(e) {
    var code = e.keyCode;
    if (code === 13) {
        returnKeyPressed(e.ctrlKey);
    } else if (code === 27) {
        escapeKeyPressed();
    }
}

function searchFieldChanged(input) {
    Query.input(input);
    search();
}

function returnKeyPressed(controlModifier) {
    var url = null;
    if (Query.isClassMode() && TOP_CLASS_LINK) {
        url = TOP_CLASS_LINK.getUrl();
    } else if (Query.isAnchorMode()) {
        url = TOP_ANCHOR_LINK.getUrl();
    }

    if (url) {
        if (controlModifier) {
            openInNewTab(url);
        } else {
            openInClassFrame(url);
        }
    }
}

function searchFieldFocus(e) {
    document.body.scrollLeft = 0;
}

function eraseButtonClick() {
    Query.erase();
    View.focusField();
    search();
}

function escapeKeyPressed() {
    Query.erase();
    search();
}


/*
 * ----------------------------------------------------------------------------
 * Call the init() method when the script has loaded.
 * ----------------------------------------------------------------------------
 */

init();

})();
