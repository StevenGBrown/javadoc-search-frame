/**
 * JAVADOC SEARCH FRAME
 *
 * This script is distributed under the MIT licence.
 * http://en.wikipedia.org/wiki/MIT_License
 * 
 * Copyright (c) 2009 Steven G. Brown
 * 
 * The initial (24th February 2008) release was a fork of the Javadoc
 * Incremental Search user script version 0.5 available at
 * http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html
 * Copyright (c) 2006 KOSEKI Kengo
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


/*
 * ----------------------------------------------------------------------------
 * GLOBAL VARIABLES
 * ----------------------------------------------------------------------------
 */

/**
 * Array of all package and class links.
 */
var ALL_PACKAGE_AND_CLASS_LINKS = [];


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
  this.assertionsCount = 0;
  this.failures = [];

  var iteration = function (unitTestFunction) {
    this.unitTestFunctionName = unitTestFunction.name;
    try {
      unitTestFunction.run();
    } catch (ex) {
      this.failures.push(new UnitTestExceptionThrownFailure(this.unitTestFunctionName, ex));
    }
  };

  this.unitTestFunctions.forEach(iteration, this);
  return new UnitTestResult(this.assertionsCount, this.failures);
};

/**
 * Assert that the actual value equals the expected value.
 * 
 * @param description a description of the assertion
 * @param actual the actual value
 * @param expected the expected value
 */
UnitTestSuite.assertThat = function (description, actual, expected) {
  if (!UnitTestSuite._equals(expected, actual)) {
    var failure = new UnitTestAssertionFailure(UnitTestSuite.unitTestFunctionName, description, actual, expected);
    UnitTestSuite.failures.push(failure);
  }
  UnitTestSuite.assertionsCount++;
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
UnitTestResult = function (numberOfAssertions, failures) {
  this.numberOfAssertions = numberOfAssertions;
  this.failures = failures;
};

/**
 * @returns true if at least one unit test failed, false otherwise
 */
UnitTestResult.prototype.failed = function () {
  return this.failures.length >= 1;
};

/**
 * @returns the total number of assertions made by the unit test
 */
UnitTestResult.prototype.getNumberOfAssertions = function () {
  return this.numberOfAssertions;
};

/**
 * @returns the number of passed assertions made by the unit test
 */
UnitTestResult.prototype.getNumberOfPassedAssertions = function () {
  return this.numberOfAssertions - this.failures.length;
};

/**
 * @returns {Array} the details of the unit test failures
 */
UnitTestResult.prototype.getFailures = function () {
  return this.failures;
};


/**
 * Create a new UnitTestAssertionFailure.
 * @class A unit test failure due to a failed assertion.
 */
UnitTestAssertionFailure = function (functionUnderTestName, description, actual, expected) {
  this.functionUnderTestName = functionUnderTestName;
  this.description = description;
  this.actual = actual;
  this.expected = expected;
}

/**
 * @returns a description of this unit test failure
 */
UnitTestAssertionFailure.prototype.toString = function () {
  return this.functionUnderTestName + '\n' + this.description + '\n'
      + 'Expected "' + this.expected + '" but was "' + this.actual + '"';
}


/**
 * Create a new UnitTestExceptionThrownFailure.
 * @class A unit test failure due to a thrown exception.
 */
UnitTestExceptionThrownFailure = function (functionUnderTestName, exception) {
  this.functionUnderTestName = functionUnderTestName;
  this.exception = exception;
}

/**
 * @returns a description of this unit test failure
 */
UnitTestExceptionThrownFailure.prototype.toString = function () {
  return this.functionUnderTestName + '\n' + 'Exception thrown: ' + this.exception;
}


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
  var rx = /href\s*=\s*(?:"|')([^"']+)(?:"|')/i;
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
  this.isInnerClass = className.indexOf('.') !== -1;
  if (this.isInnerClass) {
    this.classNameWithoutInnerClassSeparators = className.replace(/\./g, '');
    this.canonicalNameWithoutInnerClassSeparators =
        packageName + '.' + this.classNameWithoutInnerClassSeparators;
  }
};

ClassLink.prototype.matches = function (regex) {
  // The class and canonical names without the inner class separators allow a
  // Camel Case search to match an inner class.

  return regex.test(this.className) || regex.test(this.canonicalName) ||
      this.isInnerClass && (
        regex.test(this.classNameWithoutInnerClassSeparators) ||
        regex.test(this.canonicalNameWithoutInnerClassSeparators)
      );
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
  contentNodeParent : null,
  contentNode : null
};

/**
 * Access key that will focus on the search field when activated ('s').
 * To activate in Mozilla Firefox 2.0 or later press Alt+Shift+S.
 */
View.searchAccessKey = 's';

/**
 * Access key that will clear the search field when activated ('a').
 * To activate in Mozilla Firefox 2.0 or later press Alt+Shift+A.
 */
View.eraseAccessKey = 'a';

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
  if (this.searchField.value !== v) {
    this.searchField.value = v;
  }
};

View.getSearchFieldValue = function () {
  return this.searchField.value;
};

View.focusOnSearchField = function () {
  if (this.searchField) {
    this.searchField.focus();
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
  var optionsLink = this._createOptionsLink(eventHandlers);
  this.contentNodeParent = tableRowElementTwo;
  this.contentNode = tableDataCellElementTwo;

  tableElement.appendChild(tableRowElementOne);
  tableRowElementOne.appendChild(tableDataCellElementOne);
  tableDataCellElementOne.appendChild(this.searchField);
  tableDataCellElementOne.appendChild(eraseButton);
  tableDataCellElementOne.appendChild(document.createElement('br'));
  tableDataCellElementOne.appendChild(optionsLink);
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
  if (this.searchAccessKey) {
    s.setAttribute('accesskey', this.searchAccessKey);
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
  if (this.eraseAccessKey) {
    e.setAttribute('accesskey', this.eraseAccessKey);
  }
  return e;
};

View._createOptionsLink = function (eventHandlers) {
  var anchorElement = document.createElement('a');
  anchorElement.setAttribute('href', 'javascript:void(0);');
  anchorElement.textContent = 'Options';
  anchorElement.addEventListener('click', eventHandlers.optionsLinkClicked, false);
  var fontElement = document.createElement('font');
  fontElement.setAttribute('size', '-2');
  fontElement.appendChild(anchorElement);
  return fontElement;
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
  anchorLinks : null,
  bytesDownloaded : 0
};

AnchorsLoader.onprogress = null;

AnchorsLoader.load = function (classLink) {
  if (this.classLink === classLink) {
    // Already loading this class link.
    return;
  }
  this.cancel();
  this.classLink = classLink;
  this.anchorLinks = null;
  var anchorsLoader = this;
  var request = new XMLHttpRequest();
  request.onprogress = function (e) {
    anchorsLoader._onprogress(e);
  };
  request.open('GET', classLink.getUrl());
  request.onload = function (e) {
    anchorsLoader._onload(e);
  };
  request.onerror = function (e) {
    anchorsLoader._onerror(e);
  };
  request.overrideMimeType('text/plain; charset=x-user-defined');
  request.send(null);
  this.request = request;
};

AnchorsLoader.isComplete = function () {
  return this.anchorLinks !== null;
};

AnchorsLoader.getStatus = function () {
  if (this.bytesDownloaded === -1) {
    return 'ERROR';
  }
  if (this.bytesDownloaded > 1048576) {
    return 'loading... (' + Math.floor(this.bytesDownloaded / 1048576) + ' MB)';
  }
  if (this.bytesDownloaded > 1024) {
    return 'loading... (' + Math.floor(this.bytesDownloaded / 1024) + ' kB)';
  }
  if (this.bytesDownloaded > 0) {
    return 'loading... (' + this.bytesDownloaded + ' bytes)';
  }
  return 'loading...';
};

AnchorsLoader.getAnchorLinks = function () {
  return this.anchorLinks;
};

AnchorsLoader.cancel = function () {
  if (this.request) {
    this.request.abort();
  }
  this.request = null;
  this.classLink = null;
  this.anchorLinks = null;
  this.bytesDownloaded = 0;
};

AnchorsLoader._onprogress = function (e) {
  this.bytesDownloaded = e.position;
  this.onprogress();
};

AnchorsLoader._onload = function (e) {
  var names = this._getAnchorNames(this.request.responseText);
  this.anchorLinks = this._createAnchorLinkArray(this.classLink.getUrl(), names);
  this.onprogress();
};

AnchorsLoader._onerror = function (e) {
  this.bytesDownloaded = -1;
  this.onprogress();
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

  var pattern = this._getRegex(searchString);

  return function (link) {
    return link.matches(pattern);
  };
};

UnitTestSuite.testFunctionFor('RegexLibrary.createCondition()', function () {
  var javaAwtGeomPoint2DClass = new ClassLink(LinkType.CLASS, 'java.awt.geom', 'Point2D');
  var javaAwtGeomPoint2DDoubleClass = new ClassLink(LinkType.CLASS, 'java.awt.geom', 'Point2D.Double');
  var javaIoPackage = new PackageLink('java.io');
  var javaLangPackage = new PackageLink('java.lang');
  var javaIoCloseableClass = new ClassLink(LinkType.CLASS, 'java.io', 'Closeable');
  var javaLangObjectClass = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
  var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS, 'javax.swing', 'BorderFactory');
  var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder');
  var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS, 'org.omg.CORBA', 'Object');
  var hudsonPackage = new PackageLink('hudson');
  var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS, 'hudson.model', 'Hudson');

  var allLinks = [ javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
    javaIoPackage, javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
    javaxSwingBorderFactoryClass, javaxSwingBorderAbstractBorderClass,
    orgOmgCorbaObjectClass, hudsonPackage, hudsonModelHudsonClass ];

  var assertThatSearchResultFor = function (searchString, searchResult) {
    assertThat('Search for: ' + searchString,
           allLinks.filter(RegexLibrary.createCondition(searchString)),
           is(searchResult));
  };

  assertThatSearchResultFor('java.io',
      is([javaIoPackage, javaIoCloseableClass]));
  assertThatSearchResultFor('j',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass, javaIoPackage,
        javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
        javaxSwingBorderFactoryClass, javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('J',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass, javaIoPackage,
        javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
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
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass, javaLangObjectClass]));
  assertThatSearchResultFor('java.**.***o**e*',
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass, javaLangObjectClass]));
  assertThatSearchResultFor('javax.swing.border.A',
      is([javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('PoiDD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PoiDD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('hudson.Hudson',
      is([]));
});

RegexLibrary.createCaseInsensitiveExactMatchCondition = function (searchString) {
  return this._createExactMatchCondition(searchString, false);
};

RegexLibrary.createCaseSensitiveExactMatchCondition = function (searchString) {
  return this._createExactMatchCondition(searchString, true);
};

RegexLibrary._createExactMatchCondition = function (searchString, caseSensitive) {
  if (searchString.length === 0 || searchString.indexOf('*') !== -1) {
    return function (link) {
      return false;
    };
  }

  var pattern = this._getExactMatchRegex(searchString, caseSensitive);

  return function (link) {
    return link.matches(pattern);
  };
};

RegexLibrary._getRegex = function (searchString) {
  searchString = searchString.replace(/\*{2,}/g, '*');

  var pattern = '^';

  for (i = 0; i < searchString.length; i++) {
    var character = searchString.charAt(i);
    if (/[A-Z]/.test(character) && i > 0) {
      // An uppercase character which is not at the beginning of the
      // search input string. Perform a case-insensitive match of this
      // character. If the matched character is uppercase, allow any
      // number of lowercase characters or digits to be matched before
      // it. This allows for Camel Case searching.

      pattern += '(([a-z\\d]*' + character + ')|' + character.toLowerCase() + ')';
    } else if (/\d/.test(character) && i > 0) {
      // A digit character which is not at the beginning of the search
      // input string. Allow any number of lowercase characters or digits
      // to be matched before this digit. This allows for Camel Case
      // searching.

      pattern += '[a-z\\d]*' + character;
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
      // Otherwise, just add the character to the regular expression.

      pattern += character;
    }
  }

  if (!endsWith(pattern, '.*')) {
    pattern += '.*';
  }
  pattern += '$';
  return new RegExp(pattern);
};

UnitTestSuite.testFunctionFor('RegexLibrary._getRegex()', function () {
  assertThat('excess asterisk characters are removed',
         RegexLibrary._getRegex('java.**.***o**e*').pattern, is(RegexLibrary._getRegex('java.*.*o*e').pattern));
});

RegexLibrary._getExactMatchRegex = function (searchString, caseSensitive) {
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
  return caseSensitive ? new RegExp(pattern) : new RegExp(pattern, 'i');
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

    var search = this;
    UserPreference.CLASS_MENU.getValue(function (classMenu) {
      UserPreference.PACKAGE_MENU.getValue(function (packageMenu) {
        var searchContext = {};
	searchContext.classMenu = classMenu;
	searchContext.packageMenu = packageMenu;

        search.PackagesAndClasses.perform(searchContext, Query.getClassSearchString());
        search.Anchors.perform(searchContext, Query.getAnchorSearchString());
        search.Menu.perform(searchContext, Query.getMenuSearchString());

        if (searchContext.getContentNodeHTML) {
          View.setContentNodeHTML(searchContext.getContentNodeHTML());
        }
        search.topLink = searchContext.topAnchorLink || searchContext.topClassLink;

        if (!suppressLogMessage) {
          Log.message('\'' + entireSearchString + '\' in ' + stopWatch.timeElapsed() + '\n');
        }

        search._autoOpen();
      });
    });
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
  if (url) {
    UserPreference.AUTO_OPEN.getValue(function (autoOpen) {
      if (autoOpen) {
        Frames.openLinkInSummaryFrame(url);
      }
    });
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

    if (this.previousQuery !== null && searchString.indexOf(this.previousQuery) === 0) {
      // Characters have been added to the end of the previous query. Start
      // with the current search list and filter out any links that do not match.
    } else {
      // Otherwise, start with the complete search list.
      this.currentLinks = ALL_PACKAGE_AND_CLASS_LINKS.concat();
    }

    var condition = RegexLibrary.createCondition(searchString);
    this.currentLinks = this.currentLinks.filter(condition);
    var bestMatch = this._getBestMatch(searchString, this.currentLinks);
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
Search.PackagesAndClasses._getBestMatch = function (searchString, links) {
  var caseInsensitiveExactMatchCondition = RegexLibrary.createCaseInsensitiveExactMatchCondition(searchString);
  var exactMatchLinks = links.filter(caseInsensitiveExactMatchCondition);
  // If all of the links displayed in the search list are exact matches, do
  // not display a best match.
  if (exactMatchLinks.length === links.length) {
    return null;
  }
  // Attempt to reduce the matches further by performing a case-sensitive match.
  var caseSensitiveExactMatchCondition = RegexLibrary.createCaseSensitiveExactMatchCondition(searchString);
  var caseSensitiveExactMatchLinks = exactMatchLinks.filter(caseSensitiveExactMatchCondition);
  if (caseSensitiveExactMatchLinks.length > 0) {
    exactMatchLinks = caseSensitiveExactMatchLinks;
  }
  // Keep only the links with the lowest package depth.
  var bestMatchLinks = [];
  var bestMatchPackageDepth;
  var name;
  var packageDepth;
  exactMatchLinks.forEach(function (link) {
    name = (link.getType() === LinkType.PACKAGE ? link.getPackageName() : link.getCanonicalName());
    packageDepth = name.split('.').length;
    if (!bestMatchPackageDepth || packageDepth < bestMatchPackageDepth) {
      bestMatchLinks = [link];
      bestMatchPackageDepth = packageDepth;
    } else if (packageDepth === bestMatchPackageDepth) {
      bestMatchLinks.push(link);
    }
  });
  // Finally, select the first link from the remaining matches to be the best match.
  return bestMatchLinks.length > 0 ? bestMatchLinks[0] : null;
};

UnitTestSuite.testFunctionFor('Search.PackagesAndClasses._getBestMatch(searchString, links)', function () {
  var hudsonPackage = new PackageLink('hudson');
  var javaIoPackage = new PackageLink('java.io');
  var javaLangPackage = new PackageLink('java.lang');
  var javaUtilListClass = new ClassLink(LinkType.INTERFACE, 'java.util', 'List');
  var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS, 'hudson.model', 'Hudson');
  var javaAwtListClass = new ClassLink(LinkType.CLASS, 'java.awt', 'List');
  var javaIoCloseableClass = new ClassLink(LinkType.CLASS, 'java.io', 'Closeable');
  var javaLangObjectClass = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
  var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS, 'javax.swing', 'BorderFactory');
  var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder');
  var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS, 'org.omg.CORBA', 'Object');

  var allLinks = [ hudsonPackage, javaIoPackage, javaLangPackage,
    javaUtilListClass, hudsonModelHudsonClass, javaAwtListClass,
    javaIoCloseableClass, javaLangObjectClass, javaxSwingBorderFactoryClass,
    javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass ];

  var assertThatBestMatchFor = function (searchString, searchResult) {
    assertThat('Best match for: ' + searchString,
           Search.PackagesAndClasses._getBestMatch(searchString, allLinks),
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
  assertThatBestMatchFor('hudson', is(hudsonPackage));
  assertThatBestMatchFor('Hudson', is(hudsonModelHudsonClass));
  assertThatBestMatchFor('list', is(javaUtilListClass));
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

  AnchorsLoader.onprogress = function () {
    Search.perform({forceUpdate : true, suppressLogMessage : true});
  };

  AnchorsLoader.load(topClassLink);
  if (AnchorsLoader.isComplete()) {
    var anchorLinks = AnchorsLoader.getAnchorLinks();
    var condition = RegexLibrary.createCondition(searchString);
    this._append(searchContext, topClassLink, anchorLinks, condition);
  } else {
    searchContext.getContentNodeHTML = function () {
      return topClassLink.getHTML() + '<p>' + AnchorsLoader.getStatus() + '</p>';
    };
    searchContext.anchorLinksLoading = true;
  }
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

  var performMenuSearch = searchString !== null && topClassLink &&
      !searchContext.anchorLinksLoading && topAnchorLink !== null;
  if (!performMenuSearch) {
    return;
  }

  var menu = this._createMenu(searchContext, topClassLink, topAnchorLink);
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
  // It is necessary to add the context node to the document for the
  // document.evaluate function to return any results in Firefox 1.5.
  document.body.appendChild(node);
  var xpathResult = document.evaluate('//a', node, null, XPathResult.ANY_TYPE, null);
  var anchorNode;
  while ((anchorNode = xpathResult.iterateNext()) !== null) {
    var textNode = anchorNode.firstChild;
    if (textNode
        && textNode.nodeType === 3 /* Node.TEXT_NODE */
        && textNode.nodeValue.indexOf('@' + searchString) === 0) {
      Frames.openLinkInSummaryFrame(anchorNode.getAttribute('href'));
      break;
    }
  }
  document.body.removeChild(node);
};

Search.Menu._createMenu = function (searchContext, topClassLink, topAnchorLink) {
  var menu;
  if (topClassLink && topClassLink.getType() === LinkType.PACKAGE) {
    menu = searchContext.packageMenu;
  } else {
    menu = searchContext.classMenu;
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
 * options and will, when the menu is opened, be replaced with data relevant
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
 * Initialise this script.
 * @param startupLogMessage message that will be written to the log once the
 *                          script has been initialised
 */
function init(startupLogMessage) {

  UserPreference.HIDE_PACKAGE_FRAME.getValue(function (hidePackageFrame) {

    // Retrieve the innerHTML of the class frame.
    var classesInnerHTML = getClassesInnerHtml();

    // Initialise stored package and class links.
    var classLinks = getClassLinks(classesInnerHTML);
    if (hidePackageFrame) {
      var packageLinks = getPackageLinks(classLinks);
      ALL_PACKAGE_AND_CLASS_LINKS = packageLinks.concat(classLinks);
    } else {
      ALL_PACKAGE_AND_CLASS_LINKS = classLinks;
    }
    if (ALL_PACKAGE_AND_CLASS_LINKS.length === 0) {
      return false;
    }

    // Initialise class frame.
    View.initialise(EventHandlers);

    // Perform an initial search. This will populate the class frame with the
    // entire list of packages and classes.
    Search.perform({suppressLogMessage : true});

    // Run the unit test.
    var unitTestResults = UnitTestSuite.run();

    // Hide the package list frame.
    if (hidePackageFrame) {
      Frames.hideAllPackagesFrame();
    }

    // Give focus to the search field.
    View.focusOnSearchField();

    // Log the startup message.
    if (unitTestResults.failed()) {
      startupLogMessage += 'Unit test FAILED: ';
    }
    startupLogMessage +=
        unitTestResults.getNumberOfPassedAssertions() +
        ' of ' +
        unitTestResults.getNumberOfAssertions() +
        ' unit test assertions passed.\n';
    Log.startupMessage(startupLogMessage);

    // Log all unit test failures.
    unitTestResults.getFailures().forEach(function (unitTestFailure) {
      Log.message(unitTestFailure + '\n');
    });
  });
}

/**
 * Parse packages from the given array of {@ClassLink} objects.
 * 
 * @param packagesInnerHTML the inner HTML of the body element of the packages
 *                          list frame
 * @returns an array of {@PackageLink} objects
 */
function getPackageLinks(classLinks) {
  var packageLinks = [];
  var packageLinksAdded = {};
  var packageName;
  var packageUrl;

  classLinks.forEach(function (classLink) {
    packageName = classLink.getPackageName();
    if (!packageLinksAdded[packageName]) {
      packageUrl = '<A HREF="' + packageName.replace(/\./g, '/') + '/package-summary.html" target="classFrame">' + packageName + '</A>';
      packageLinks.push(new PackageLink(packageName, packageUrl));
      packageLinksAdded[packageName] = true;
    }
  });

  packageLinks.sort(function (packageLinkOne, packageLinkTwo) {
    var packageNameOneComponents = packageLinkOne.getPackageName().split(/\./);
    var packageNameTwoComponents = packageLinkTwo.getPackageName().split(/\./);
    var smallerLength = Math.min(packageNameOneComponents.length, packageNameTwoComponents.length);
    for (i = 0; i < smallerLength; i++) {
      if (packageNameOneComponents[i] < packageNameTwoComponents[i]) {
        return -1;
      }
      if (packageNameOneComponents[i] > packageNameTwoComponents[i]) {
        return 1;
      }
    }
    return packageNameOneComponents.length - packageNameTwoComponents.length;
  });
  return packageLinks;
}

UnitTestSuite.testFunctionFor('getPackageLinks(classLinks)', function () {

  var classLinks = [
      new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder', ''),
      new ClassLink(LinkType.CLASS, 'java.awt', 'Button', ''),
      new ClassLink(LinkType.CLASS, 'javax.swing', 'SwingWorker', '')
  ];

  var expectedPackageLinks = [
      new PackageLink('java.awt', '<A HREF="java/awt/package-summary.html" target="classFrame">java.awt</A>'),
      new PackageLink('javax.swing', '<A HREF="javax/swing/package-summary.html" target="classFrame">javax.swing</A>'),
      new PackageLink('javax.swing.border', '<A HREF="javax/swing/border/package-summary.html" target="classFrame">javax.swing.border</A>')
  ];

  assertThat('getPackageLinks([javax.swing.border.AbstractBorder, java.awt.Button, javax.swing.SwingWorker])',
      getPackageLinks(classLinks), is(expectedPackageLinks));
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

EventHandlers.optionsLinkClicked = function (event) {
  OptionsPage.open();
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
      Frames.openLinkInSummaryFrame(url);
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
