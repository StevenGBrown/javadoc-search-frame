// ==UserScript==
// @name          Javadoc Search Frame
// @namespace     http://userscripts.org/users/46156
// @description   Incremental search frame for Javadoc packages and classes.
// @homepage      http://code.google.com/p/javadoc-search-frame
// @version       DEVELOPMENT
// @include       */allclasses-frame.html
// ==/UserScript==

var SCRIPT_META_DATA = {
    name : 'Javadoc Search Frame',
    version : 'DEVELOPMENT',
    homepage : 'http://code.google.com/p/javadoc-search-frame'
};

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
 * Access key that will clear the search field when activated ('a').
 * To activate in Mozilla Firefox 2.0 or later press Alt+Shift+A.
 */
var ERASE_ACCESS_KEY = 'a';

var ALL_LINKS = [];


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
    gmLogAvailable : function () {
        try {
            return GM_log;
        } catch (ex) {
            return false;
        }
    }()
};

/**
 * Log the given object to the Error Console as a message.
 */
Log.message = function (logMessage) {
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
        if (one.length !== two.length) {
            return false;
        }
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
    return this.exceptionThrown;
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
UserPreference = function (key, defaultValue) {
    this.key = key;
    this.defaultValue = defaultValue;
};

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
 * FRAMES
 * ----------------------------------------------------------------------------
 */

/**
 * @class Frames (undocumented).
 */
Frames = {
    previousURLOpenedInSummaryFrame : null
};

Frames.getAllPackagesFrame = function () {
    return this._getFrame('packageListFrame');
};

Frames.hideAllPackagesFrame = function () {
    var framesets = parent.document.getElementsByTagName('frameset');
    if (framesets) {
        var frameset = framesets[1];
        if (frameset) {
            frameset.setAttribute('rows', '0,*');
            frameset.setAttribute('border', 0);
            frameset.setAttribute('frameborder', 0);
            frameset.setAttribute('framespacing', 0);
            scroll(0, 0);
        }
    }
};

Frames.getSummaryFrame = function () {
    return this._getFrame('classFrame');
};

Frames.openInSummaryFrame = function (url, reload) {
    if (reload || this.previousURLOpenedInSummaryFrame === null || url !== this.previousURLOpenedInSummaryFrame) {
        var summaryFrame = this.getSummaryFrame();
        if (summaryFrame) {
            this.previousURLOpenedInSummaryFrame = url;
            summaryFrame.location.href = url;
        }
    }
}

Frames._getFrame = function (name) {
    if (this[name]) {
        return this[name];
    }
    var frame;
    var i;
    for (i = 0; i < parent.frames.length; i++) {
        frame = parent.frames[i];
        if (frame && frame.name === name && frame.document) {
            this[name] = frame;
            return frame;
        }
    }
    return null;
};


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
                    '<b>' + key + '</b><br/>\n' +
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
                        'Settings cannot be configured. The GM_getValue and GM_setValue ' +
                        'functions are not supported by your browser.\n' +
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
                       '<p>' + result.exception + '</p>\n';
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
            'Version: ' + SCRIPT_META_DATA.version + '<br/>\n' +
            '<a href="' + SCRIPT_META_DATA.homepage + '">' + SCRIPT_META_DATA.homepage + '</a>\n' +
            '</p>\n' +
            '<hr/>\n' +
            '<p><h2>' + page.title + '</h2></p>\n' +
            '<hr/>\n';
    pageBodyInnerHTML += page.getContents();

    var summaryFrame = Frames.getSummaryFrame();
    var pageDocument = summaryFrame.document;
    pageDocument.body.innerHTML = pageBodyInnerHTML;

    if (page.registerEventListeners) {
        page.registerEventListeners(pageDocument);
    }
};


/*
 * ----------------------------------------------------------------------------
 * LINKTYPE
 * ----------------------------------------------------------------------------
 */

/**
 * @class LinkType (undocumented).
 */
LinkType = function(name, header) {
    this.name = name;
    this.header = header;
};

LinkType.prototype.getName = function () {
    return this.name;
};

LinkType.prototype.getHeader = function () {
    return this.header;
};

LinkType.prototype.toString = function () {
    return this.name;
};

LinkType.PACKAGE = new LinkType('package', 'Packages');
LinkType.INTERFACE = new LinkType('interface', 'Interfaces');
LinkType.CLASS = new LinkType('class', 'Classes');
LinkType.ENUM = new LinkType('enum', 'Enums');
LinkType.EXCEPTION = new LinkType('exception', 'Exceptions');
LinkType.ERROR = new LinkType('error', 'Errors');
LinkType.ANNOTATION = new LinkType('annotation', 'Annotation Types');

LinkType.values = function () {
    return [ LinkType.PACKAGE, LinkType.INTERFACE, LinkType.CLASS,
        LinkType.ENUM, LinkType.EXCEPTION, LinkType.ERROR, LinkType.ANNOTATION ];
};


/*
 * ----------------------------------------------------------------------------
 * PACKAGELINK AND CLASSLINK
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
 * @class PackageLink (undocumented).
 */
PackageLink = function (packageName, html) {
    this.packageName = packageName;
    this.html = html || '<br/>';
    this.url = null;
};

PackageLink.prototype.matches = function (regex) {
    return regex.test(this.packageName);
};

PackageLink.prototype.getHTML = function () {
    return this.html;
};

PackageLink.prototype.getType = function () {
    return LinkType.PACKAGE;
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
    return obj instanceof PackageLink &&
           this.packageName === obj.packageName &&
           this.html === obj.html;
};

PackageLink.prototype.toString = function () {
    return this.html + ' (' + this.packageName + ')';
};


/**
 * @class ClassLink (undocumented).
 */
ClassLink = function (type, packageName, className, html) {
    this.type = type;
    this.className = className;
    this.html = html || '<br/>';
    this.url = null;
    this.canonicalName = packageName + '.' + className;
};

ClassLink.prototype.matches = function (regex) {
    return regex.test(this.className) || regex.test(this.canonicalName);
};

ClassLink.prototype.getHTML = function () {
    return this.html;
};

ClassLink.prototype.getType = function () {
    return this.type;
};

ClassLink.prototype.getClassName = function () {
    return this.className;
};

ClassLink.prototype.getPackageName = function () {
    return this.canonicalName.substring(0, this.canonicalName.length - this.className.length - 1);
};

ClassLink.prototype.getCanonicalName = function () {
    return this.canonicalName;
};

ClassLink.prototype.getUrl = function () {
    if (!this.url) {
        this.url = parseURL(this.html);
    }
    return this.url;
};

ClassLink.prototype.equals = function (obj) {
    return obj instanceof ClassLink &&
           this.type === obj.type &&
           this.canonicalName === obj.canonicalName &&
           this.html === obj.html;
};

ClassLink.prototype.toString = function () {
    return this.html + ' (' + this.canonicalName + ')';
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
    searchField : null,
    unitTestFailedWarningParent : null,
    unitTestFailedWarning : null,
    contentNodeParent : null,
    contentNode : null
};

View.initialise = function (eventHandlers) {
    this._create(eventHandlers);
};

View.setContentNodeHTML = function (contents) {
    var newNode = this.contentNode.cloneNode(false);
    newNode.innerHTML = contents;
    this.contentNodeParent.replaceChild(newNode, this.contentNode);
    this.contentNode = newNode;
};

View.getContentNode = function () {
    return this.contentNode;
};

View.setSearchFieldValue = function (v) {
    this.searchField.value = v;
};

View.getSearchFieldValue = function () {
    return this.searchField.value;
};

View.focusOnSearchField = function () {
    if (this.searchField) {
        this.searchField.focus();
    }
};

View.warnOfFailedUnitTest = function () {
    if (Frames.getSummaryFrame()) {
        this.unitTestFailedWarningParent.appendChild(this.unitTestFailedWarning);
    }
};

View._create = function (eventHandlers) {
    var tableElement = document.createElement('table');
    var tableRowElementOne = document.createElement('tr');
    var tableDataCellElementOne = document.createElement('td');
    var tableRowElementTwo = document.createElement('tr');
    var tableDataCellElementTwo = document.createElement('td');

    this.searchField = this._createSearchField(eventHandlers);
    var eraseButton = this._createEraseButton(eventHandlers);
    var settingsLink = this._createSettingsLink(eventHandlers);
    this.contentNodeParent = tableRowElementTwo;
    this.contentNode = tableDataCellElementTwo;
    if (Frames.getSummaryFrame()) {
        this.unitTestFailedWarning = this._createUnitTestFailedWarning(eventHandlers);
        this.unitTestFailedWarningParent = tableDataCellElementOne;
    }

    tableElement.appendChild(tableRowElementOne);
    tableRowElementOne.appendChild(tableDataCellElementOne);
    tableDataCellElementOne.appendChild(this.searchField);
    tableDataCellElementOne.appendChild(eraseButton);
    tableDataCellElementOne.appendChild(document.createElement('br'));
    if (Frames.getSummaryFrame()) {
        tableDataCellElementOne.appendChild(settingsLink);
    }
    tableElement.appendChild(tableRowElementTwo);
    tableRowElementTwo.appendChild(tableDataCellElementTwo);

    [tableElement, tableRowElementOne, tableDataCellElementOne,
            tableRowElementTwo, tableDataCellElementTwo].forEach(function (element) {
        element.style.border = '0';
        element.style.width = '100%';
    });

    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }
    document.body.appendChild(tableElement);
};

View._createSearchField = function (eventHandlers) {
    var s = document.createElement('input');
    s.setAttribute('type', 'text');
    s.addEventListener('keyup', eventHandlers.searchFieldKeyup, false);
    s.addEventListener('onchange', eventHandlers.searchFieldChanged, false);
    s.addEventListener('focus', eventHandlers.searchFieldFocus, false);
    if (SEARCH_ACCESS_KEY) {
        s.setAttribute('accesskey', SEARCH_ACCESS_KEY);
    }
    this._watch(s, eventHandlers.searchFieldChanged, 200);
    return s;
};

View._createEraseButton = function (eventHandlers) {
    var iconErase = 'data:image/gif;base64,R0lGODlhDQANAJEDAM%2FPz%2F%2F%2F%2F93d3UpihSH5BAEAAAMALAAAAAANAA0AAAIwnCegcpcg4nIw2sRGDZYnBAWiIHJQRZbec5XXEqnrmXIupMWdZGCXlAGhJg0h7lAAADs%3D';

    var e = document.createElement('input');
    e.setAttribute('type', 'image');
    e.setAttribute('src', iconErase);
    e.setAttribute('style', 'margin-left: 2px');
    e.addEventListener('click', eventHandlers.eraseButtonClick, false);
    if (ERASE_ACCESS_KEY) {
        e.setAttribute('accesskey', ERASE_ACCESS_KEY);
    }
    return e;
};

View._createSettingsLink = function (eventHandlers) {
    var anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', 'javascript:void(0);');
    anchorElement.appendChild(document.createTextNode(WebPage.SETTINGS.title));
    anchorElement.addEventListener('click', eventHandlers.settingsLinkClicked, false);
    var fontElement = document.createElement('font');
    fontElement.setAttribute('size', '-2');
    fontElement.appendChild(anchorElement);
    return fontElement;
};

View._createUnitTestFailedWarning = function (eventHandlers) {
    var anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', 'javascript:void(0);');
    anchorElement.appendChild(document.createTextNode('Unit test failed. Click here for details.'));
    anchorElement.addEventListener('click', eventHandlers.unitTestResultsLinkClicked, false);
    var fontElement = document.createElement('font');
    fontElement.setAttribute('size', '-2');
    fontElement.appendChild(anchorElement);
    var italicElement = document.createElement('i');
    italicElement.appendChild(fontElement);
    var paragraphElement = document.createElement('p');
    paragraphElement.appendChild(italicElement);
    return paragraphElement;
};

View._watch = function (element, callback, msec) {
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
    classSearchString : '',
    anchorSearchString : null,
    menuSearchString : null
};

Query.getClassSearchString = function () {
    return this.classSearchString;
};

Query.getAnchorSearchString = function () {
    return this.anchorSearchString;
};

Query.getMenuSearchString = function () {
    return this.menuSearchString;
};

Query.getEntireSearchString = function () {
    var searchString = this.classSearchString;
    if (this.anchorSearchString !== null) {
        searchString += '#';
        searchString += this.anchorSearchString;
    }
    if (this.menuSearchString !== null) {
        searchString += '@';
        searchString += this.menuSearchString;
    }
    return searchString;
};

Query.input = function (input) {
    this._processInput(input);
    this._updateView();
};

Query.erase = function () {
    this._processErase();
    this._updateView();
};

Query._processInput = function (input) {
    var searchString;
    if (this.menuSearchString !== null) {
        searchString = this.classSearchString;
        if (this.anchorSearchString !== null) {
            searchString += '#' + this.anchorSearchString;
        }
        if (input.indexOf('@') !== -1) {
            searchString += input;
        }
    } else if (this.anchorSearchString !== null) {
        searchString = this.classSearchString + input;
    } else {
        searchString = input;
    }

    var tokens = [];
    var splitOnPrefix;
    ['@', '#'].forEach(function (prefix) {
        if (searchString.indexOf(prefix) !== -1) {
            splitOnPrefix = searchString.split(prefix, 2);
            tokens.push(splitOnPrefix[1]);
            searchString = splitOnPrefix[0];
        } else {
            tokens.push(null);
        }
    });

    this.classSearchString = searchString;
    this.anchorSearchString = tokens[1];
    this.menuSearchString = tokens[0];
};

Query._processErase = function () {
    if (this.menuSearchString !== null) {
        this.menuSearchString = null;
    } else if (this.anchorSearchString !== null) {
        this.anchorSearchString = null;
    } else {
        this.classSearchString = '';
    }
};

Query._updateView = function () {
    var searchString = this.getEntireSearchString();

    var fieldValue = searchString;
    if (fieldValue.indexOf('#') !== -1) {
        var splitOnHashCharacter = fieldValue.split('#', 2);
        fieldValue = '#' + splitOnHashCharacter[1];
    }
    var indexOfAtCharacter = fieldValue.indexOf('@');
    if (indexOfAtCharacter !== -1) {
        var splitOnAtCharacter = fieldValue.split('@', 2);
        if (splitOnAtCharacter[1].length > 0) {
            fieldValue = splitOnAtCharacter[0];
        } else {
            fieldValue = '@';
        }
    }

    View.setSearchFieldValue(fieldValue);
};


/*
 * ----------------------------------------------------------------------------
 * ANCHORLINK
 * ----------------------------------------------------------------------------
 */

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
    var html = '<a href="' + url + '" target="classFrame" class="anchorLink"';
    if (keywordOrNot) {
        html += ' style="color:#666"';
    }
    html += '>' + name.replace(/ /g, '&nbsp;') + '</a><br/>';
    return html;
};


/*
 * ----------------------------------------------------------------------------
 * ANCHORS LOADER
 * ----------------------------------------------------------------------------
 */

/**
 * @class AnchorsLoader (undocumented).
 */
AnchorsLoader = {
    request : null,
    classLink : null,
    anchorLinks : null
};

AnchorsLoader.load = function (classLink, callbacks) {
    if (this.classLink === classLink) {
        if (this.anchorLinks !== null) {
            callbacks.alreadyLoaded(this.anchorLinks);
        }
        return;
    }
    this.classLink = classLink;
    this.anchorLinks = null;
    callbacks.loading(classLink);
    var anchorsLoader = this;
    var request = new XMLHttpRequest();
    request.open('GET', classLink.getUrl());
    request.onreadystatechange = function () { 
        if (request.readyState === 4 && request.responseText) { 
            anchorsLoader._completed(request.responseText, classLink, callbacks.loadingComplete);
        }
    };
    request.send();
    this.request = request;
};

AnchorsLoader.cancel = function () {
    if (this.request) {
        this.request.abort();
    }
    this.request = null;
    this.classLink = null;
    this.anchorLinks = null;
};

AnchorsLoader._completed = function (responseText, classLink, loadingCompleteCallback) {
    var names = this._getAnchorNames(responseText);
    this.anchorLinks = this._createAnchorLinkArray(classLink.getUrl(), names);
    loadingCompleteCallback(this.anchorLinks);
};

AnchorsLoader._createAnchorLinkArray = function (baseurl, names) {
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

AnchorsLoader._getAnchorNames = function (doc) {
    var pat = /<a name=\"([^\"]+)\"/gi;
    var i = 0;
    var matches;
    var names = [];
    while ((matches = pat.exec(doc)) !== null) {
        names.push(matches[1]);
    }
    return names;
};


/*
 * ----------------------------------------------------------------------------
 * REGEX LIBRARY
 * ----------------------------------------------------------------------------
 */

/**
 * @class RegexLibrary (undocumented).
 */
RegexLibrary = {};

RegexLibrary.createCondition = function (searchString) {
    if (searchString.length === 0 || searchString === '*') {
        return function (link) {
            return true;
        };
    }

    var pattern = this.getRegex(searchString);

    return function (link) {
        return link.matches(pattern);
    };
};

UnitTestSuite.testFunctionFor('RegexLibrary.createCondition()', function () {
    var javaIoPackage = new PackageLink('java.io');
    var javaLangPackage = new PackageLink('java.lang');
    var javaIoCloseableClass = new ClassLink(LinkType.CLASS, 'java.io', 'Closeable');
    var javaLangObjectClass = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
    var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS, 'javax.swing', 'BorderFactory');
    var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder');
    var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS, 'org.omg.CORBA', 'Object');

    var allLinks = [ javaIoPackage, javaLangPackage, javaIoCloseableClass,
        javaLangObjectClass, javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass ];

    var assertThatSearchResultFor = function (searchString, searchResult) {
        assertThat('Search for: ' + searchString,
                   allLinks.filter(RegexLibrary.createCondition(searchString)),
                   is(searchResult));
    };

    assertThatSearchResultFor('java.io',
            is([javaIoPackage, javaIoCloseableClass]));
    assertThatSearchResultFor('j',
            is([javaIoPackage, javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
                javaxSwingBorderFactoryClass, javaxSwingBorderAbstractBorderClass]));
    assertThatSearchResultFor('J',
            is([javaIoPackage, javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
                javaxSwingBorderFactoryClass, javaxSwingBorderAbstractBorderClass]));
    assertThatSearchResultFor('Object',
            is([javaLangObjectClass, orgOmgCorbaObjectClass]));
    assertThatSearchResultFor('O',
            is([javaLangObjectClass, orgOmgCorbaObjectClass]));
    assertThatSearchResultFor('java.lang.Object',
            is([javaLangObjectClass]));
    assertThatSearchResultFor('JAVA.LANG.OBJECT',
            is([javaLangObjectClass]));
    assertThatSearchResultFor('java.lang',
            is([javaLangPackage, javaLangObjectClass]));
    assertThatSearchResultFor('java.lang.',
            is([javaLangObjectClass]));
    assertThatSearchResultFor('java.*.o*e',
            is([javaLangObjectClass]));
    assertThatSearchResultFor('java.*.*o*e',
            is([javaIoCloseableClass, javaLangObjectClass]));
    assertThatSearchResultFor('java.**.***o**e*',
            is([javaIoCloseableClass, javaLangObjectClass]));
    assertThatSearchResultFor('javax.swing.border.A',
            is([javaxSwingBorderAbstractBorderClass]));
});

RegexLibrary.createExactMatchCondition = function (searchString) {
    if (searchString.length === 0 || searchString.indexOf('*') !== -1) {
        return function (link) {
            return false;
        };
    }

    var pattern = this.getExactMatchRegex(searchString);

    return function (link) {
        return link.matches(pattern);
    };
};

RegexLibrary.getRegex = function (searchString) {
    searchString = searchString.replace(/\*{2,}/g, '*');

    var pattern = '^';

    for (i = 0; i < searchString.length; i++) {
        var character = searchString.charAt(i);
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
        } else if (RegexLibrary._isSpecialRegularExpressionCharacter(character)) {
           // A special regular expression character, but not an asterisk.
           // Escape this character.

           pattern += '\\' + character;
        } else {

            pattern += character;
        }
    }

    if (!endsWith(pattern, '.*')) {
        pattern += '.*';
    }
    pattern += '$';
    return new RegExp(pattern);
};

UnitTestSuite.testFunctionFor('RegexLibrary.getRegex()', function () {
    assertThat('excess asterisk characters are removed',
               RegexLibrary.getRegex('java.**.***o**e*').pattern, is(RegexLibrary.getRegex('java.*.*o*e').pattern));
});

RegexLibrary.getExactMatchRegex = function (searchString) {
    var pattern = '^';

    for (i = 0; i < searchString.length; i++) {
        var character = searchString.charAt(i);
        if (this._isSpecialRegularExpressionCharacter(character)) {
           pattern += '\\' + character;
        } else {
            pattern += character;
        }
    }

    pattern += '$';
    return new RegExp(pattern, "i");
};

RegexLibrary._isSpecialRegularExpressionCharacter = function (character) {
    return ['\\', '^', '$', '+', '?', '.', '(', ':', '!', '|', '{', ',', '[', '*'].some(function (specialCharacter) {
        return character === specialCharacter;
    });
};


/*
 * ----------------------------------------------------------------------------
 * SEARCH
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search (undocumented).
 */
Search = {
    previousEntireSearchString : null,
    topLink : null
};

Search.perform = function (parameters) {
    var stopWatch = new StopWatch();
    if (parameters) {
        var forceUpdate = parameters.forceUpdate;
        var suppressLogMessage = parameters.suppressLogMessage;
    }

    var entireSearchString = Query.getEntireSearchString();
    if (forceUpdate ||
            this.previousEntireSearchString === null ||
            entireSearchString !== this.previousEntireSearchString) {

        var searchContext = {};
        this.PackagesAndClasses.perform(searchContext, Query.getClassSearchString());
        this.Anchors.perform(searchContext, Query.getAnchorSearchString());
        this.Menu.perform(searchContext, Query.getMenuSearchString());

        if (searchContext.getContentNodeHTML) {
            View.setContentNodeHTML(searchContext.getContentNodeHTML());
        }
        this.topLink = searchContext.topAnchorLink || searchContext.topClassLink;

        if (!suppressLogMessage) {
            Log.message('\n' +
                '\'' + entireSearchString + '\' in ' + stopWatch.timeElapsed() + '\n'
            );
        }

        this._autoOpen();
    }

    this.previousEntireSearchString = entireSearchString;
};

Search.getTopLinkURL = function () {
    if (this.topLink) {
        return this.topLink.getUrl();
    }
    return null;
};

Search._autoOpen = function () {
    var url = this.getTopLinkURL();
    if (url && UserPreference.AUTO_OPEN.getValue()) {
        Frames.openInSummaryFrame(url);
    }
};


/*
 * ----------------------------------------------------------------------------
 * SEARCH.PACKAGESANDCLASSES
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search.PackagesAndClasses (undocumented).
 */
Search.PackagesAndClasses = {
    previousQuery : null,
    currentLinks : null,
    topLink : null
};

Search.PackagesAndClasses.perform = function (searchContext, searchString) {
    if (this.previousQuery === null || this.previousQuery !== searchString) {
        var condition = RegexLibrary.createCondition(searchString);
        var exactMatchCondition = RegexLibrary.createExactMatchCondition(searchString);

        if (this.previousQuery !== null && searchString.indexOf(this.previousQuery) === 0) {
            // Characters have been added to the end of the previous query. Start
            // with the current search list and filter out any links that do not match.
        } else {
            // Otherwise, start with the complete search list.
            this.currentLinks = ALL_LINKS.concat();
        }

        this.currentLinks = this.currentLinks.filter(condition);
        var bestMatch = this._getBestMatch(exactMatchCondition, this.currentLinks);
        this.topLink = this._getTopLink(this.currentLinks, bestMatch);
    }

    this.previousQuery = searchString;

    var constructHTML = this._constructHTML;
    var currentLinks = this.currentLinks;
    searchContext.getContentNodeHTML = function () {
        return constructHTML(currentLinks, bestMatch);
    };

    searchContext.topClassLink = this.topLink;
};

Search.PackagesAndClasses._getTopLink = function (links, bestMatch) {
    if (bestMatch) {
        return bestMatch;
    }
    if (links.length > 0) {
        return links[0];
    }
    return null;
};

UnitTestSuite.testFunctionFor('Search.PackagesAndClasses._getTopLink(classLinks, bestMatch)', function () {
    var classLinkOne = new ClassLink(LinkType.CLASS, 'java.awt', 'Component', 'java/awt/Component');
    var classLinkTwo = new ClassLink(LinkType.CLASS, 'java.lang', 'Object', 'java/lang/Object');
    var getTopLink = Search.PackagesAndClasses._getTopLink;

    assertThat('no links, best match undefined', getTopLink([]), is(null));
    assertThat('one link, best match undefined', getTopLink([classLinkOne]), is(classLinkOne));
    assertThat('two links, best match undefined', getTopLink([classLinkOne, classLinkTwo]), is(classLinkOne));
    assertThat('no links, best match defined', getTopLink([], classLinkOne), is(classLinkOne));
    assertThat('one link, best match defined', getTopLink([classLinkOne], classLinkTwo), is(classLinkTwo));
});

/**
 * Get the best match (if any) from the given array of links.
 */
Search.PackagesAndClasses._getBestMatch = function (exactMatchCondition, links) {
    var exactMatchLinks = links.filter(exactMatchCondition);
    // If all of the links displayed in the search list are exact matches, do
    // not display a best match.
    if (exactMatchLinks.length === links.length) {
        return null;
    }
    // If there is more than one exact match, choose the link with the shortest
    // name to be the best match.
    var bestMatch = null;
    var bestMatchNameLength;
    var name;
    exactMatchLinks.forEach(function (link) {
        name = (link.getType() === LinkType.PACKAGE ? link.getPackageName() : link.getCanonicalName());
        if (!bestMatch || name.length < bestMatchNameLength) {
            bestMatch = link;
            bestMatchNameLength = name.length;
        }
    });
    return bestMatch;
};

UnitTestSuite.testFunctionFor('Search.PackagesAndClasses._getBestMatch(exactMatchCondition, links)', function () {
    var javaIoPackage = new PackageLink('java.io');
    var javaLangPackage = new PackageLink('java.lang');
    var javaIoCloseableClass = new ClassLink(LinkType.CLASS, 'java.io', 'Closeable');
    var javaLangObjectClass = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
    var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS, 'javax.swing', 'BorderFactory');
    var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder');
    var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS, 'org.omg.CORBA', 'Object');

    var allLinks = [ javaIoPackage, javaLangPackage, javaIoCloseableClass,
        javaLangObjectClass, javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass ];

    var assertThatBestMatchFor = function (searchString, searchResult) {
        var exactMatchCondition = RegexLibrary.createExactMatchCondition(searchString);
        assertThat('Best match for: ' + searchString,
                   Search.PackagesAndClasses._getBestMatch(exactMatchCondition, allLinks),
                   is(searchResult));
    };

    assertThatBestMatchFor('java.io', is(javaIoPackage));
    assertThatBestMatchFor('j', is(null));
    assertThatBestMatchFor('J', is(null));
    assertThatBestMatchFor('Object', is(javaLangObjectClass));
    assertThatBestMatchFor('O', is(null));
    assertThatBestMatchFor('java.lang.Object', is(javaLangObjectClass));
    assertThatBestMatchFor('JAVA.LANG.OBJECT', is(javaLangObjectClass));
    assertThatBestMatchFor('org.omg.CORBA.Object', is(orgOmgCorbaObjectClass));
    assertThatBestMatchFor('java.lang', is(javaLangPackage));
    assertThatBestMatchFor('java.lang.', is(null));
    assertThatBestMatchFor('java.*.o*e', is(null));
    assertThatBestMatchFor('java.*.*o*e', is(null));
    assertThatBestMatchFor('javax.swing.border.A', is(null));
});

Search.PackagesAndClasses._constructHTML = function (classLinks, bestMatch) {
    if (classLinks.length === 0) {
        return 'No search results.';
    }
    var html = '';
    if (bestMatch && classLinks.length > 1) {
        html += '<br/><b><i>Best Match</i></b><br/>';
        html += bestMatch.getType().getName();
        html += '<br/>';
        html += bestMatch.getHTML();
        html += '<br/>';
    }
    var type;
    var newType;
    classLinks.forEach(function (link) {
        newType = link.getType();
        if (type !== newType) {
            html += '<br/><b>' + newType.getHeader() + '</b><br/>';
            type = newType;
        }
        html += link.getHTML();
        html += '<br/>';
    });
    return html;
};


/*
 * ----------------------------------------------------------------------------
 * SEARCH.ANCHORS
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search.Anchors (undocumented).
 */
Search.Anchors = {};

Search.Anchors.perform = function (searchContext, searchString) {
    var topClassLink = searchContext.topClassLink;

    if (searchString === null || !topClassLink) {
        AnchorsLoader.cancel();
        return;
    }

    var searchAnchors = this;
    AnchorsLoader.load(topClassLink, {
        alreadyLoaded : function (anchorLinks) {
            var condition = RegexLibrary.createCondition(searchString);
            searchAnchors._append(searchContext, topClassLink, anchorLinks, condition);
            searchContext.anchorLinksLoaded = true;
        },
        loading : function () {
            searchContext.contentNodeHTML = topClassLink.getHTML() + '<p>loading...</p>';
        },
        loadingComplete : function () {
            Search.perform({forceUpdate : true});
        }
    });
};

Search.Anchors._append = function (searchContext, topClassLink, anchorLinks, condition) {
    var matchingAnchorLinks = anchorLinks.filter(condition);
    searchContext.topAnchorLink = matchingAnchorLinks.length > 0 ? matchingAnchorLinks[0] : null;

    searchContext.getContentNodeHTML = function () {
        var html = '';
        if (matchingAnchorLinks.length === 0) {
            html += 'No search results.';
        } else {
           matchingAnchorLinks.forEach(function (anchorLink) {
                html += anchorLink.getHTML();
            });
        }
        return topClassLink.getHTML() + '<p>' + html + '</p>';
    };
};


/*
 * ----------------------------------------------------------------------------
 * SEARCH.MENU
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search.Menu (undocumented).
 */
Search.Menu = {
    menuReplacement : null
};

Search.Menu.perform = function (searchContext, searchString) {
    var topClassLink = searchContext.topClassLink;
    var topAnchorLink = searchContext.topAnchorLink;

    if (searchString === null || !searchContext.anchorLinksLoaded ||
            (!topClassLink && topAnchorLink === undefined) || topAnchorLink === null) {
        return;
    }

    var menu = this._createMenu(topClassLink, topAnchorLink);
    searchContext.getContentNodeHTML = function () {
        var html = topClassLink.getHTML();
        if (topAnchorLink) {
            html += '<br/>' + topAnchorLink.getHTML();
        }
        html += '<p>' + menu + '</p>';
        return html;
    };

    if (!searchString) {
        return;
    }

    var node = document.createElement('p');
    node.innerHTML = menu;
    var xpathResult = document.evaluate('//a', node, null,
                                        XPathResult.ANY_TYPE, null);
    var anchorNode;
    while ((anchorNode = xpathResult.iterateNext()) !== null) {
        var textNode = anchorNode.firstChild;
        if (textNode
                && textNode.nodeType === 3 /* Node.TEXT_NODE */
                && textNode.nodeValue.indexOf('@' + searchString) === 0) {
            Frames.openInSummaryFrame(anchorNode.getAttribute('href'), true);
            Search.perform();
            return;
        }
    }
};

Search.Menu._createMenu = function (topClassLink, topAnchorLink) {
    var menu;
    if (topClassLink && topClassLink.getType() === LinkType.PACKAGE) {
        menu = UserPreference.PACKAGE_MENU.getValue();
    } else {
        menu = UserPreference.CLASS_MENU.getValue();
    }
    var menuReplacement = this._getMenuReplacement();
    var rx = /##(\w+)##/;
    var matches;
    while ((matches = rx.exec(menu)) !== null) {
        var f = menuReplacement[matches[1]];
        var rx2 = new RegExp(matches[0], 'g');
        if (f) {
            menu = menu.replace(rx2, f(topClassLink, topAnchorLink));
        } else {
            menu = menu.replace(rx2, '');
        }
    }
    return menu;
};

/**
 * Placeholder values that can be entered into the class_menu or package_menu
 * settings and will, when the menu is opened, be replaced with data relevant
 * to the current package or class.
 */
Search.Menu._getMenuReplacement = function () {
    if (!this.menuReplacement) {
        this.menuReplacement = {
            CLASS_NAME: function (classLink) { 
                return classLink ? classLink.getClassName() : '';
            },
            PACKAGE_NAME: function (classOrPackageLink) { 
                return classOrPackageLink ? classOrPackageLink.getPackageName() : '';
            },
            PACKAGE_PATH: function (classOrPackageLink) { 
                return classOrPackageLink ? classOrPackageLink.getPackageName().replace(/\./g, '/') : '';
            },
            ANCHOR_NAME: function (classOrPackageLink, anchorLink) {
                return anchorLink ? anchorLink.getNameWithoutParameter() : '';
            }
        };
    }
    return this.menuReplacement;
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

    // If running Google Chrome, check that this is the correct document. This
    // is necessary since, as of January 2009, Google Chrome ignores the
    // @include metadata tag.
    var browserIsChrome = navigator.userAgent.toLowerCase().indexOf('chrome') !== -1;
    if (browserIsChrome && !endsWith(document.location.toString(), '/allclasses-frame.html')) {
        return;
    }

    // Retrieve the innerHTML of the package and class frames.
    var retrieveInnerHtmlStopWatch = new StopWatch();
    var packagesInnerHTML = getPackagesInnerHtml();
    var classesInnerHTML = getClassesInnerHtml();
    retrieveInnerHtmlStopWatch.stop();

    // Initialise stored class links.
    var searchListStopWatch = new StopWatch();
    var packageLinks = getPackageLinks(packagesInnerHTML);
    var classLinks = getClassLinks(classesInnerHTML);
    ALL_LINKS = packageLinks.concat(classLinks);
    if (ALL_LINKS.length === 0) {
        return false;
    }
    searchListStopWatch.stop();

    // Initialise class frame.
    var initContainerStopWatch = new StopWatch();
    View.initialise(EventHandlers);
    initContainerStopWatch.stop();

    // Perform an initial search. This will populate the class frame with the
    // entire list of packages and classes.
    var initialSearchStopWatch = new StopWatch();
    Search.perform({suppressLogMessage : true});
    initialSearchStopWatch.stop();

    // Run the unit test.
    var unitTestStopWatch = new StopWatch();
    var unitTestResults = UnitTestSuite.run();
    if (unitTestResults.failed()) {
        View.warnOfFailedUnitTest();
    }
    unitTestStopWatch.stop();

    // Hide the package list frame.
    if (Frames.getAllPackagesFrame()) {
        var hidePackageFrameStopWatch = new StopWatch();
        Frames.hideAllPackagesFrame();
        hidePackageFrameStopWatch.stop();
    }

    // Give focus to the search field.
    var focusSearchFieldStopWatch = new StopWatch();
    View.focusOnSearchField();
    focusSearchFieldStopWatch.stop();

    Log.message('\n' +
        'initialised in ' + initStopWatch.timeElapsed() + ' total\n' +
        '- contents of existing frames retrieved in ' + retrieveInnerHtmlStopWatch.timeElapsed() + '\n' +
        '- search list constructed in ' + searchListStopWatch.timeElapsed() + '\n' +
        '- container initialised in ' + initContainerStopWatch.timeElapsed() + '\n' +
        '- initial search performed in ' + initialSearchStopWatch.timeElapsed() + '\n' +
        '- unit test run in ' + unitTestStopWatch.timeElapsed() + '\n' +
        (hidePackageFrameStopWatch ?
            '- package frame hidden in ' + hidePackageFrameStopWatch.timeElapsed() + '\n' : '') +
        '- search field given focus in ' + focusSearchFieldStopWatch.timeElapsed() + '\n'
    );
}

/**
 * @return the inner HTML of the body element of the package list frame, or undefined if the element does not exist
 */
function getPackagesInnerHtml() {
    var allPackagesFrame = Frames.getAllPackagesFrame();
    var packagesInnerHTML;
    if (allPackagesFrame && allPackagesFrame.document.body) {
        packagesInnerHTML = allPackagesFrame.document.body.innerHTML;
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
    var packagesRegex = /<a[^>]+>([^<]+)<\/a\s*>/gi;

    while ((matches = packagesRegex.exec(packagesInnerHTML)) !== null) {
        if (matches[1] !== 'All Classes') {
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

    var packagePath = 'java/applet/';
    var package = 'java.applet';

    var lowerCaseHtml =
            '<a href="' + packagePath + 'package-frame.html" target="packageFrame">' + package + '</a>';
    var lowerCaseLink = new PackageLink(package,
            '<a href="' + packagePath + 'package-summary.html" target="classFrame">' + package + '</a>');
    assertThat('lowercase html tags',
            getPackageLinks(lowerCaseHtml), is([lowerCaseLink]));

    var upperCaseHtml =
            '<A HREF="' + packagePath + 'package-frame.html" TARGET="packageFrame">' + package + '</A>';
    var upperCaseLink = new PackageLink(package,
            '<A HREF="' + packagePath + 'package-summary.html" target="classFrame">' + package + '</A>');
    assertThat('uppercase html tags',
            getPackageLinks(upperCaseHtml), is([upperCaseLink]));

    var lowerCaseWithWhitespaceHtml =
            '<a   href  =  "' + packagePath + 'package-frame.html"   target  =  "packageFrame"  >' +
            package + '</a  >';
    var lowerCaseWithWhitespaceLink = new PackageLink(package,
            '<a   href  =  "' + packagePath + 'package-summary.html"   target="classFrame"  >' +
            package + '</a  >');
    assertThat('lowercase html tags with additional whitespace',
            getPackageLinks(lowerCaseWithWhitespaceHtml),
            is([lowerCaseWithWhitespaceLink]));

    var upperCaseWithWhitespaceHtml =
            '<A   HREF  =  "' + packagePath + 'package-frame.html"   TARGET  =  "packageFrame"  >' +
            package + '</A  >';
    var upperCaseWithWhitespaceLink = new PackageLink(package,
            '<A   HREF  =  "' + packagePath + 'package-summary.html"   target="classFrame"  >' +
            package + '</A  >');
    assertThat('uppercase html tags with additional whitespace',
            getPackageLinks(upperCaseWithWhitespaceHtml),
            is([upperCaseWithWhitespaceLink]));

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
 * @returns an array of {@link ClassLink} objects
 */
function getClassLinks(classesInnerHTML) {
    if (!classesInnerHTML) {
        return [];
    }

    var cl;
    var matches;

    var classLinksMap = {};
    LinkType.values().forEach(function (type) {
        classLinksMap[type] = [];
    });

    function checkForExceptionOrErrorType(type, className) {
        if (type === LinkType.CLASS) {
            if (endsWith(className, 'Exception')) {
                type = LinkType.EXCEPTION;
            } else if (endsWith(className, 'Error')) {
                type = LinkType.ERROR;
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
        var type = LinkType[typeInTitle.toUpperCase()];
        type = checkForExceptionOrErrorType(type, className);

        cl = new ClassLink(
                type, packageName, className, entireMatch + '&nbsp;[&nbsp;' + packageName + '&nbsp;]');
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
            var type = openingItalicTag ? LinkType.INTERFACE : LinkType.CLASS;
            type = checkForExceptionOrErrorType(type, className);

            var packageName = packageNameInHref.replace(/\/|\\/g, '.');
            cl = new ClassLink(
                    type, packageName, className, entireMatch + '&nbsp;[&nbsp;' + packageName + '&nbsp;]');
            classLinksMap[type].push(cl);
        }
    }

    var classLinks = [];
    LinkType.values().forEach(function (type) {
        classLinks = classLinks.concat(classLinksMap[type]);
    });
    return classLinks;
}

UnitTestSuite.testFunctionFor('getClassLinks(classesInnerHTML)', function () {

    function assert(args, html, description) {
        var link = new ClassLink(
            args.type, args.package, args.class, html + '&nbsp;[&nbsp;' + args.package + '&nbsp;]');
        assertThat(description, getClassLinks(html), is([link]));
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
            href:'javax/swing/AbstractAction.html', type:LinkType.CLASS,
            package:'javax.swing', class:'AbstractAction', italic:false} );

    // Assert that interfaces are matched correctly. Interfaces can be matched with or without a title attribute.
    // If an anchor has no title attribute, the contents of the anchor must in italics to be recognised as an interface.

    runTitleAndNoTitleTestCase( {
            href:'javax/swing/text/AbstractDocument.AttributeContext.html', type:LinkType.INTERFACE,
            package:'javax.swing.text', class:'AbstractDocument.AttributeContext', italic:true} );
    runTitleTestCase( {
            href:'javax/swing/text/AbstractDocument.AttributeContext.html', type:LinkType.INTERFACE,
            package:'javax.swing.text', class:'AbstractDocument.AttributeContext', italic:false} );

    // Assert that enumerations are matched correctly.
    // Anchors must have a title attribute to be recognised as an enumeration.
    runTitleTestCase( {
            href:'java/net/Authenticator.RequestorType.html', type:LinkType.ENUM,
            package:'java.net', class:'Authenticator.RequestorType', italic:false} );

    // Assert that exceptions are matched correctly. Exceptions can be matched with or without a title attribute.
    runTitleAndNoTitleTestCase( {
            href:'java/security/AccessControlException.html', type:LinkType.EXCEPTION,
            typeInTitle:'class', package:'java.security', class:'AccessControlException', italic:false} );

    // Assert that errors are matched correctly. Errors can be matched with or without a title attribute.
    runTitleAndNoTitleTestCase( {
            href:'java/lang/AbstractMethodError.html', type:LinkType.ERROR,
            typeInTitle:'class', package:'java.lang', class:'AbstractMethodError', italic:false} );

    // Assert that annotations are matched correctly. Anchors must have a title attribute to be recognised as an annotation.
    runTitleTestCase( {
            href:'javax/xml/ws/Action.html', type:LinkType.ANNOTATION,
            package:'javax.xml.ws', class:'Action', italic:false} );
});

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
 * ----------------------------------------------------------------------------
 * EVENT HANDLERS
 * ----------------------------------------------------------------------------
 */

/**
 * @class EventHandlers (undocumented).
 */
EventHandlers = {};

EventHandlers.searchFieldKeyup = function (e) {
    var code = e.keyCode;
    if (code === 13) {
        EventHandlers._returnKeyPressed(e.ctrlKey);
    } else if (code === 27) {
        EventHandlers._escapeKeyPressed();
    }
};

EventHandlers.searchFieldChanged = function (input) {
    Query.input(input);
    Search.perform();
};

EventHandlers.searchFieldFocus = function (e) {
    document.body.scrollLeft = 0;
};

EventHandlers.eraseButtonClick = function () {
    Query.erase();
    View.focusOnSearchField();
    Search.perform();
};

EventHandlers.settingsLinkClicked = function () {
    WebPage.SETTINGS.open();
    event.preventDefault();
};

EventHandlers.unitTestResultsLinkClicked = function () {
    WebPage.UNIT_TEST_RESULTS.open();
    event.preventDefault();
};

EventHandlers._returnKeyPressed = function (controlModifier) {
    var searchFieldValue = View.getSearchFieldValue();
    Query.input(searchFieldValue);
    Search.perform();

    var url = Search.getTopLinkURL();
    if (url) {
        if (controlModifier) {
            window.open(url);
        } else {
            Frames.openInSummaryFrame(url);
        }
    }
};

EventHandlers._escapeKeyPressed = function () {
    var searchFieldValue = View.getSearchFieldValue();
    if (searchFieldValue) {
        Query.erase();
        Search.perform();
    }
};


/*
 * ----------------------------------------------------------------------------
 * Call the init() method when the script has loaded.
 * ----------------------------------------------------------------------------
 */

init();

})();
