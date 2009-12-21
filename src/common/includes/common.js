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
 * Global variables
 * ----------------------------------------------------------------------------
 */

/**
 * Array of all package and class links.
 */
var ALL_PACKAGE_AND_CLASS_LINKS = [];


/*
 * ----------------------------------------------------------------------------
 * UnitTestSuite
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
 * Has no effect; intended to make calls to the {@link UnitTestSuite.assertThat}
 * and {@link UnitTestSuite.assertThatEval} functions more readable.
 * @returns the value paramter (unchanged)
 * @example assertThat(theSky, is(blue));
 */
UnitTestSuite.is = function (value) {
  return value;
};

/**
 * Quotes the given string value in the same way as the Console or Error Log.
 * @returns the quoted string
 */
UnitTestSuite.quote = function (stringValue) {
  if (stringValue || stringValue === '') {
    return '\'' + stringValue + '\'';
  }
  return stringValue;
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


/*
 * ----------------------------------------------------------------------------
 * UnitTestResult
 * ----------------------------------------------------------------------------
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
 * @returns a description of this unit test result
 */
UnitTestResult.prototype.toString = function () {
  var result = '';
  if (this.failures.length >= 1) {
    result += 'Unit test FAILED: ';
  }
  result +=
      this.numberOfAssertions - this.failures.length +
      ' of ' +
      this.numberOfAssertions +
      ' unit test assertions passed.\n';
  this.failures.forEach(function (unitTestFailure) {
    result += '\n' + unitTestFailure + '\n';
  });
  return result;
};


/*
 * ----------------------------------------------------------------------------
 * UnitTestAssertionFailure
 * ----------------------------------------------------------------------------
 */

/**
 * Create a new UnitTestAssertionFailure.
 * @class A unit test failure due to a failed assertion.
 */
UnitTestAssertionFailure = function (functionUnderTestName, description, actual, expected) {
  this.functionUnderTestName = functionUnderTestName;
  this.description = description;
  this.actual = actual;
  this.expected = expected;
};

/**
 * @returns a description of this unit test failure
 */
UnitTestAssertionFailure.prototype.toString = function () {
  var failureString = this.functionUnderTestName + '\n';
  if (this.description) {
    failureString += this.description + '\n';
  }
  failureString += 'Expected "' + this.expected + '" but was "' + this.actual + '"';
  return failureString;
};


/*
 * ----------------------------------------------------------------------------
 * UnitTestExceptionThrownFailure
 * ----------------------------------------------------------------------------
 */

/**
 * Create a new UnitTestExceptionThrownFailure.
 * @class A unit test failure due to a thrown exception.
 */
UnitTestExceptionThrownFailure = function (functionUnderTestName, exception) {
  this.functionUnderTestName = functionUnderTestName;
  this.exception = exception;
};

/**
 * @returns a description of this unit test failure
 */
UnitTestExceptionThrownFailure.prototype.toString = function () {
  return this.functionUnderTestName + '\n' + this.exception;
};


/*
 * ----------------------------------------------------------------------------
 * LinkType
 * ----------------------------------------------------------------------------
 */

/**
 * @class LinkType Package, class, method and keyword link types.
 */
LinkType = function(singularName, pluralName) {
  this.singularName = singularName;
  this.pluralName = pluralName;
};

/**
 * @returns the singular name of this type
 */
LinkType.prototype.getSingularName = function () {
  return this.singularName;
};

/**
 * @returns the plural name of this type
 */
LinkType.prototype.getPluralName = function () {
  return this.pluralName;
};

/**
 * @returns a string representation of this type
 */
LinkType.prototype.toString = function () {
  return this.singularName;
};

/**
 * Package link type.
 */
LinkType.PACKAGE = new LinkType('Package', 'Packages');

/**
 * Interface link type.
 */
LinkType.INTERFACE = new LinkType('Interface', 'Interfaces');

/**
 * Class link type.
 */
LinkType.CLASS = new LinkType('Class', 'Classes');

/**
 * Enum link type.
 */
LinkType.ENUM = new LinkType('Enum', 'Enums');

/**
 * Exception link type.
 */
LinkType.EXCEPTION = new LinkType('Exception', 'Exceptions');

/**
 * Error link type.
 */
LinkType.ERROR = new LinkType('Error', 'Errors');

/**
 * Annotation link type.
 */
LinkType.ANNOTATION = new LinkType('Annotation', 'Annotation Types');

/**
 * Method link type.
 */
LinkType.METHOD = new LinkType('Method', 'Methods');

/**
 * Keyword link type.
 */
LinkType.KEYWORD = new LinkType('Keyword', 'Keywords');

/**
 * Get the link type with the given singular name.
 * 
 * @param singluarName
 * @returns the link type
 */
LinkType.getByName = function (singularName) {
  return LinkType[singularName.toUpperCase()];
};

/**
 * Call the given function with each link type.
 * 
 * @param forEachFunction
 */
LinkType.forEach = function (forEachFunction) {
  var all = [
      LinkType.PACKAGE, LinkType.INTERFACE, LinkType.CLASS, LinkType.ENUM,
      LinkType.EXCEPTION, LinkType.ERROR, LinkType.ANNOTATION, LinkType.METHOD,
      LinkType.KEYWORD
  ];
  all.forEach(forEachFunction);
};


/*
 * ----------------------------------------------------------------------------
 * PackageLink, ClassLink, MethodLink and KeywordLink
 * ----------------------------------------------------------------------------
 */

/**
 * Extract a URL from the given link.
 * @param link the link
 * @returns the URL
 */
function extractUrl(link) {
  var html = link.getHtml();
  // Assume that the HTML starts with <A HREF="..."
  var firstQuoteIndex = html.indexOf('"');
  var secondQuoteIndex = html.indexOf('"', firstQuoteIndex + 1);
  return html.substring(firstQuoteIndex + 1, secondQuoteIndex);
}

/**
 * Convert the given relative URL to an absolute URL.
 * @param relativeUrl the relative URL
 * @returns the absolute URL
 */
function toAbsoluteUrl(relativeUrl) {
  var windowUrl = location.href;
  return windowUrl.substring(0, windowUrl.lastIndexOf('/') + 1) + relativeUrl;
}


/**
 * @class PackageLink Link to a package. These links are of type
 *                    {@LinkType.PACKAGE}.
 */
PackageLink = function (packageName) {
  this.packageName = packageName;
  this.html = '<A HREF="' + packageName.replace(/\./g, '/') +
      '/package-summary.html" target="classFrame">' + packageName + '</A>';
};

/**
 * Determine whether this link matches the given regular expression.
 * 
 * @param regex the regular expression
 * @returns true if this link is a match, false otherwise
 */
PackageLink.prototype.matches = function (regex) {
  return regex.test(this.packageName);
};

/**
 * @returns this link in HTML format
 */
PackageLink.prototype.getHtml = function () {
  return this.html;
};

UnitTestSuite.testFunctionFor('PackageLink.getHtml', function () {
  assertThat('', new PackageLink('java.applet').getHtml(),
      is('<A HREF="java/applet/package-summary.html" target="classFrame">java.applet</A>'));
});

/**
 * @returns {@LinkType} the type of this link
 */
PackageLink.prototype.getType = function () {
  return LinkType.PACKAGE;
};

/**
 * @returns the name of this package
 */
PackageLink.prototype.getPackageName = function () {
  return this.packageName;
};

/**
 * @returns the URL of this link
 */
PackageLink.prototype.getUrl = function () {
  return toAbsoluteUrl(extractUrl(this));
};

UnitTestSuite.testFunctionFor('PackageLink.getUrl', function () {
  assertThat('', new PackageLink('java.applet').getUrl(),
      is(toAbsoluteUrl('java/applet/package-summary.html')));
});

/**
 * Equals function.
 * 
 * @param obj
 * @returns true if this link is equal to the given object, false otherwise
 */
PackageLink.prototype.equals = function (obj) {
  return obj instanceof PackageLink &&
       this.packageName === obj.packageName;
};

/**
 * @returns a string representation of this link
 */
PackageLink.prototype.toString = function () {
  return this.packageName;
};


/**
 * @class ClassLink Link to a class. These links are of type
 *                  {@LinkType.INTERFACE}, {@LinkType.CLASS}, {@LinkType.ENUM},
 *                  {@LinkType.EXCEPTION}, {@LinkType.ERROR} or
 *                  {@LinkType.ANNOTATION}.
 */
ClassLink = function (type, packageName, className) {
  this.type = type;
  this.className = className;
  this.canonicalName = packageName + '.' + className;

  this.innerClassNames = [];
  var name = className;
  while (true) {
    var index = name.indexOf('.');
    if (index === -1) {
      break;
    }
    name = name.substring(index + 1);
    this.innerClassNames.push(name);
  }

  var typeInHtml = type;
  if (type === LinkType.EXCEPTION || type === LinkType.ERROR) {
    typeInHtml = LinkType.CLASS;
  }
  var openingTag = '';
  var closingTag = '';
  if (type === LinkType.INTERFACE) {
    openingTag = '<I>';
    closingTag = '</I>';
  }
  this.html = '<A HREF="' + packageName.replace(/\./g, '/') + '/' + className +
      '.html" title="' + typeInHtml.getSingularName().toLowerCase() + ' in ' +
      packageName + '" target="classFrame">' + openingTag + className +
      closingTag + '</A>&nbsp;[&nbsp;' + packageName + '&nbsp;]';
};

/**
 * Determine whether this link matches the given regular expression.
 * 
 * @param regex the regular expression
 * @returns true if this link is a match, false otherwise
 */
ClassLink.prototype.matches = function (regex) {
  return regex.test(this.className) || regex.test(this.canonicalName) ||
      this.innerClassNames.some(function (innerClassName) {
        return regex.test(innerClassName);
      });
};

/**
 * @returns this link in HTML format
 */
ClassLink.prototype.getHtml = function () {
  return this.html;
};

UnitTestSuite.testFunctionFor('ClassLink.getHtml', function () {
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text', 'AbstractDocument.AttributeContext').getHtml(),
      is('<A HREF="javax/swing/text/AbstractDocument.AttributeContext.html" title="interface in javax.swing.text" target="classFrame"><I>AbstractDocument.AttributeContext</I></A>&nbsp;[&nbsp;javax.swing.text&nbsp;]'));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util', 'AbstractAnnotationValueVisitor6').getHtml(),
      is('<A HREF="javax/lang/model/util/AbstractAnnotationValueVisitor6.html" title="class in javax.lang.model.util" target="classFrame">AbstractAnnotationValueVisitor6</A>&nbsp;[&nbsp;javax.lang.model.util&nbsp;]'));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang', 'Thread.State').getHtml(),
      is('<A HREF="java/lang/Thread.State.html" title="enum in java.lang" target="classFrame">Thread.State</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security', 'AccessControlException').getHtml(),
      is('<A HREF="java/security/AccessControlException.html" title="class in java.security" target="classFrame">AccessControlException</A>&nbsp;[&nbsp;java.security&nbsp;]'));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation', 'AnnotationFormatError').getHtml(),
      is('<A HREF="java/lang/annotation/AnnotationFormatError.html" title="class in java.lang.annotation" target="classFrame">AnnotationFormatError</A>&nbsp;[&nbsp;java.lang.annotation&nbsp;]'));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang', 'Deprecated').getHtml(),
      is('<A HREF="java/lang/Deprecated.html" title="annotation in java.lang" target="classFrame">Deprecated</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
});

/**
 * @returns {@LinkType} the type of this link
 */
ClassLink.prototype.getType = function () {
  return this.type;
};

/**
 * @returns the simple name of this class
 */
ClassLink.prototype.getClassName = function () {
  return this.className;
};

/**
 * @returns the name of the package that contains this class
 */
ClassLink.prototype.getPackageName = function () {
  return this.canonicalName.substring(0, this.canonicalName.length - this.className.length - 1);
};

/**
 * @returns the canonical name of this class
 */
ClassLink.prototype.getCanonicalName = function () {
  return this.canonicalName;
};

/**
 * @returns the URL of this link
 */
ClassLink.prototype.getUrl = function () {
  return toAbsoluteUrl(extractUrl(this));
};

UnitTestSuite.testFunctionFor('ClassLink.getUrl', function () {
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text', 'AbstractDocument.AttributeContext').getUrl(),
      is(toAbsoluteUrl('javax/swing/text/AbstractDocument.AttributeContext.html')));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util', 'AbstractAnnotationValueVisitor6').getUrl(),
      is(toAbsoluteUrl('javax/lang/model/util/AbstractAnnotationValueVisitor6.html')));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang', 'Thread.State').getUrl(),
      is(toAbsoluteUrl('java/lang/Thread.State.html')));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security', 'AccessControlException').getUrl(),
      is(toAbsoluteUrl('java/security/AccessControlException.html')));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation', 'AnnotationFormatError').getUrl(),
      is(toAbsoluteUrl('java/lang/annotation/AnnotationFormatError.html')));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang', 'Deprecated').getUrl(),
      is(toAbsoluteUrl('java/lang/Deprecated.html')));
});

/**
 * Equals function.
 * 
 * @param obj
 * @returns true if this link is equal to the given object, false otherwise
 */
ClassLink.prototype.equals = function (obj) {
  return obj instanceof ClassLink &&
       this.type === obj.type &&
       this.className === obj.className &&
       this.canonicalName === obj.canonicalName;
};

/**
 * @returns a string representation of this link
 */
ClassLink.prototype.toString = function () {
  return this.canonicalName;
};


/**
 * @class MethodLink Link to a method.
 */
MethodLink = function (baseUrl, name) {
  this.name = name;
  this.html = '<A HREF="' + baseUrl + '#' + name +
      '" target="classFrame" class="anchorLink">' +
      name.replace(/ /g, '&nbsp;') + '</A><BR/>';
};

/**
 * Determine whether this link matches the given regular expression.
 * 
 * @param regex the regular expression
 * @returns true if this link is a match, false otherwise
 */
MethodLink.prototype.matches = function (regex) {
  return regex.test(this.name);
};

/**
 * @returns this link in HTML format
 */
MethodLink.prototype.getHtml = function () {
  return this.html;
};

/**
 * @returns {@LinkType} the type of this link
 */
MethodLink.prototype.getType = function () {
  return LinkType.METHOD;
};

/**
 * @returns the URL of this link
 */
MethodLink.prototype.getUrl = function () {
  return extractUrl(this);
};

/**
 * @returns the name of this method
 */
MethodLink.prototype.getMethodName = function () {
  if (this.name.indexOf('(') !== -1) {
    return this.name.substring(0, this.name.indexOf('('));
  } else {
    return this.name;
  }
};


/**
 * @class KeywordLink Keyword link found on a package or class page.
 */
KeywordLink = function (baseUrl, name) {
  this.name = name;
  this.html = '<A HREF="' + baseUrl + '#' + name +
      '" target="classFrame" class="anchorLink" style="color:#666">' +
      name.replace(/ /g, '&nbsp;') + '</A><BR/>';
};

/**
 * Determine whether this link matches the given regular expression.
 * 
 * @param regex the regular expression
 * @returns true if this link is a match, false otherwise
 */
KeywordLink.prototype.matches = function (regex) {
  return regex.test(this.name);
};

/**
 * @returns this link in HTML format
 */
KeywordLink.prototype.getHtml = function () {
  return this.html;
};

/**
 * @returns {@LinkType} the type of this link
 */
KeywordLink.prototype.getType = function () {
  return LinkType.KEYWORD;
};

/**
 * @returns the URL of this link
 */
KeywordLink.prototype.getUrl = function () {
  return extractUrl(this);
};


/*
 * ----------------------------------------------------------------------------
 * View
 * ----------------------------------------------------------------------------
 */

/**
 * @class View Provides access to the UI elements of the frame containing the
 *             search field.
 */
View = {
  searchField : null,
  contentNodeParent : null,
  contentNode : null
};

/**
 * Access key that will focus on the search field when activated ('s').
 * This access key can be activated by pressing either Alt+s or Alt+Shift+s,
 * depending on the internet browser.
 */
View.searchAccessKey = 's';

/**
 * Access key that will clear the search field when activated ('a').
 * This access key can be activated by pressing either Alt+a or Alt+Shift+a,
 * depending on the internet browser.
 */
View.eraseAccessKey = 'a';

/**
 * Initialise the search field frame.
 * @param eventHandlers
 */
View.initialise = function (eventHandlers) {
  this._create(eventHandlers);
};

/**
 * Set the HTML contents of the area below the search field.
 * @param contents
 */
View.setContentsHtml = function (contents) {
  var newNode = this.contentNode.cloneNode(false);
  newNode.innerHTML = contents;
  this.contentNodeParent.replaceChild(newNode, this.contentNode);
  this.contentNode = newNode;
};

/**
 * Set the value displayed in the search field.
 * @param value
 */
View.setSearchFieldValue = function (value) {
  if (this.searchField.value !== value) {
    this.searchField.value = value;
  }
};

/**
 * @returns the current value displayed in the search field.
 */
View.getSearchFieldValue = function () {
  return this.searchField.value;
};

/**
 * Give focus to the search field.
 */
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
  s.addEventListener('input', eventHandlers.searchFieldChanged, false);
  s.addEventListener('focus', eventHandlers.searchFieldFocus, false);
  if (this.searchAccessKey) {
    s.setAttribute('accesskey', this.searchAccessKey);
  }
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


/*
 * ----------------------------------------------------------------------------
 * Query
 * ----------------------------------------------------------------------------
 */

/**
 * @class Query Constructs the text entered into the search field into a search
 *              query.
 */
Query = {
  packageOrClassSearchString : '',
  methodOrKeywordSearchString : null,
  menuSearchString : null
};

/**
 * @returns the portion of the search query that relates to the packages and
 *          classes search
 */
Query.getPackageOrClassSearchString = function () {
  return this.packageOrClassSearchString;
};

/**
 * @returns the portion of the search query that relates to the methods and
 *          keywords search
 */
Query.getMethodOrKeywordSearchString = function () {
  return this.methodOrKeywordSearchString;
};

/**
 * @returns the portion of the search query that relates to the package menu or
 *          class menu
 */
Query.getMenuSearchString = function () {
  return this.menuSearchString;
};

/**
 * @returns the entire search query
 */
Query.getEntireSearchString = function () {
  var searchString = this.packageOrClassSearchString;
  if (this.methodOrKeywordSearchString !== null) {
    searchString += '#';
    searchString += this.methodOrKeywordSearchString;
  }
  if (this.menuSearchString !== null) {
    searchString += '@';
    searchString += this.menuSearchString;
  }
  return searchString;
};

/**
 * Update this query based on the contents of the search field.
 * @param searchFieldContents
 */
Query.update = function (searchFieldContents) {
  this._processInput(searchFieldContents);
  this._updateView();
};

Query._processInput = function (searchFieldContents) {
  var searchString;
  if (this.menuSearchString !== null) {
    searchString = this.packageOrClassSearchString;
    if (this.methodOrKeywordSearchString !== null) {
      searchString += '#' + this.methodOrKeywordSearchString;
    }
    if (searchFieldContents.indexOf('@') !== -1) {
      searchString += searchFieldContents;
    }
  } else if (this.methodOrKeywordSearchString !== null) {
    searchString = this.packageOrClassSearchString + searchFieldContents;
  } else {
    searchString = searchFieldContents;
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

  this.packageOrClassSearchString = searchString;
  this.methodOrKeywordSearchString = tokens[1];
  this.menuSearchString = tokens[0];
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
 * RegexLibrary
 * ----------------------------------------------------------------------------
 */

/**
 * @class RegexLibrary Library of regular expressions used by this script.
 */
RegexLibrary = {};

/**
 * Create and return a function that will take a {@PackageLink}, {@ClassLink},
 * {@MethodLink} or {@KeywordLink} as an argument and return true if that link
 * matches the given search string and return false otherwise.
 * 
 * @param searchString
 * @returns the created function
 */
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

UnitTestSuite.testFunctionFor('RegexLibrary.createCondition', function () {
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
  var testOuterAppleBananaClass = new ClassLink(LinkType.CLASS, 'test', 'Outer.Apple.Banana');

  var allLinks = [ javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
    javaIoPackage, javaLangPackage, javaIoCloseableClass, javaLangObjectClass,
    javaxSwingBorderFactoryClass, javaxSwingBorderAbstractBorderClass,
    orgOmgCorbaObjectClass, hudsonPackage, hudsonModelHudsonClass,
    testOuterAppleBananaClass ];

  var assertThatSearchResultFor = function (searchString, searchResult) {
    assertThat(UnitTestSuite.quote(searchString),
           allLinks.filter(RegexLibrary.createCondition(searchString)),
           is(searchResult));
  };

  assertThatSearchResultFor('java.io',
      is([javaIoPackage, javaIoCloseableClass]));
  assertThatSearchResultFor('JI',
      is([javaIoPackage, javaIoCloseableClass]));
  assertThatSearchResultFor('JW',
      is([]));
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
      is([javaLangObjectClass, orgOmgCorbaObjectClass, testOuterAppleBananaClass]));
  assertThatSearchResultFor('java.lang.Object',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('JLO',
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
  assertThatSearchResultFor('PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('JAGPD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('hudson.Hudson',
      is([]));
  assertThatSearchResultFor('Double',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.Double',
      is([]));
  assertThatSearchResultFor('Apple',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Apple',
      is([]));
  assertThatSearchResultFor('Apple.Banana',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Apple.Banana',
      is([]));
  assertThatSearchResultFor('AB',
      is([javaxSwingBorderAbstractBorderClass, testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.AB',
      is([]));
  assertThatSearchResultFor('Banana',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Banana',
      is([]));
  assertThatSearchResultFor('Ja.Aw.',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
});

/**
 * Create and return a function that will take a {@PackageLink}, {@ClassLink},
 * {@MethodLink} or {@KeywordLink} as an argument and return true if that link
 * is a case-sensitive exact match for the given search string and return false
 * otherwise.
 * 
 * @param searchString
 * @returns the created function
 */
RegexLibrary.createCaseInsensitiveExactMatchCondition = function (searchString) {
  return this._createExactMatchCondition(searchString, false);
};

/**
 * Create and return a function that will take a {@PackageLink}, {@ClassLink},
 * {@MethodLink} or {@KeywordLink} as an argument and return true if that link
 * is a case-sensitive exact match for the given search string and return false
 * otherwise.
 * 
 * @param searchString
 * @returns the created function
 */
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
  var pattern = '^';

  var remainingSearchString = searchString.replace(/\*{2,}/g, '*');
  var token;
  var previousToken;
  while (remainingSearchString.length > 0) {
    var previousToken = token;

    var camelCaseTokenMatch = /^[A-Z][a-z\\d]*/.exec(remainingSearchString);
    if (camelCaseTokenMatch) {
      token = camelCaseTokenMatch[0];

      // A Camel Case expression, consisting of a leading character (uppercase)
      // and one or more trailing characters (consisting of lowercase
      // characters and digit characters).

      var leadingCharacter = token.charAt(0);
      var trailingCharacters = token.substring(1);
      var trailingCharactersPattern = '[a-z\\d]*' + trailingCharacters + '[a-z\\d]*';

      if (remainingSearchString === searchString) {
        // The Camel Case expression is at the start of the search string.
        // Perform a case-insensitive match of the leading character, then
        // match the trailing characters along with other lowercase characters
        // or digit characters.
        pattern += '(' + leadingCharacter + '|' + leadingCharacter.toLowerCase() + ')' + trailingCharactersPattern;
      } else {
        // The Camel Case expression is NOT at the start of the search string.
        pattern += '(' +
            // Optionally match a period character, then match the leading
            // character, then match the trailing characters along with other
            // lowercase characters or digit characters. The optional period
            // character allows inner classes to be matched by this Camel Case
            // expression.
            '(\\.?' + leadingCharacter + trailingCharactersPattern + ')' +
            // OR
            '|' +
            // Match a period character, then match the leading character in
            // lowercase, then match the trailing characters along with other
            // lowercase characters or digit characters. This clause allows
            // package names to be matched by this Camel Case expression.
            '(' + (endsWith(previousToken, '.') ? '' : '\\.') + leadingCharacter.toLowerCase() + trailingCharactersPattern + ')' +
            // OR
            '|' +
            // Match the Camel Case expression in lowercase. This clause
            // performs a direct case-sensitive match of the characters.
            leadingCharacter.toLowerCase() + trailingCharacters +
            ')';
      }
    } else {
      token = remainingSearchString.charAt(0);

      if (/[a-z]/.test(token)) {
        // A lowercase character that is not part of a Camel Case expression.
        // Perform a case-insensitive match of this character.

        pattern += '(' + token.toUpperCase() + '|' + token + ')';
      } else if (token === '*') {
        // Replace '*' with '.*' to allow the asterisk to be used as a wildcard.

        pattern += '.*';
      } else if (RegexLibrary._isSpecialRegularExpressionCharacter(token)) {
         // A special regular expression character, but not an asterisk.
         // Escape this character.

         pattern += '\\' + token;
      } else {
        // Otherwise, add the character directly to the regular expression.

        pattern += token;
      }
    }
    remainingSearchString = remainingSearchString.substring(token.length);
  }

  if (!endsWith(pattern, '.*')) {
    pattern += '.*';
  }
  pattern += '$';
  return new RegExp(pattern);
};

UnitTestSuite.testFunctionFor('RegexLibrary._getRegex', function () {
  assertThat('removal of excess asterisk characters',
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
 * Search
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search The searching functionality.
 */
Search = {
  previousEntireSearchString : null,
  topLink : null
};

/**
 * Perform a search.
 */
Search.perform = function () {
  var entireSearchString = Query.getEntireSearchString();
  this._performSearch(entireSearchString);
  this.previousEntireSearchString = entireSearchString;
};

/**
 * Perform a search only if the search string has changed.
 */
Search.performIfSearchStringHasChanged = function () {
  var entireSearchString = Query.getEntireSearchString();
  if (this.previousEntireSearchString === null ||
      entireSearchString !== this.previousEntireSearchString) {
    this._performSearch(entireSearchString);
  }
  this.previousEntireSearchString = entireSearchString;
};

/**
 * @returns the URL of the link currently displayed at the top of the list, or
 *          null if no links are currently displayed
 */
Search.getTopLinkUrl = function () {
  if (this.topLink) {
    return this.topLink.getUrl();
  }
  return null;
};

Search._performSearch = function (entireSearchString) {
  var search = this;
  Option.CLASS_MENU.getValue(function (classMenu) {
    Option.PACKAGE_MENU.getValue(function (packageMenu) {
      var searchContext = {};
      searchContext.classMenu = classMenu;
      searchContext.packageMenu = packageMenu;

      search._PackagesAndClasses._perform(searchContext, Query.getPackageOrClassSearchString());
      search._MethodsAndKeywords._perform(searchContext, Query.getMethodOrKeywordSearchString());
      search._Menu._perform(searchContext, Query.getMenuSearchString());

      if (searchContext.getContentNodeHtml) {
        View.setContentsHtml(searchContext.getContentNodeHtml());
      }
      search.topLink = searchContext.topMethodOrKeywordLink || searchContext.topPackageOrClassLink;

      search._autoOpen();
    });
  });
};

Search._autoOpen = function () {
  var url = this.getTopLinkUrl();
  if (url) {
    Option.AUTO_OPEN.getValue(function (autoOpen) {
      if (autoOpen) {
        Frames.openLinkInSummaryFrame(url);
      }
    });
  }
};


/*
 * ----------------------------------------------------------------------------
 * Search._PackagesAndClasses
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search._PackagesAndClasses Component of the search functionality that
 *                                   deals with package and class links.
 * @private
 */
Search._PackagesAndClasses = {
  previousQuery : null,
  currentLinks : null,
  topLink : null
};

Search._PackagesAndClasses._perform = function (searchContext, searchString) {
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

  var constructHtml = this._constructHtml;
  var currentLinks = this.currentLinks;
  searchContext.getContentNodeHtml = function () {
    return constructHtml(currentLinks, bestMatch);
  };

  searchContext.topPackageOrClassLink = this.topLink;
};

Search._PackagesAndClasses._getTopLink = function (links, bestMatch) {
  if (bestMatch) {
    return bestMatch;
  }
  if (links.length > 0) {
    return links[0];
  }
  return null;
};

UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getTopLink', function () {
  var linkOne = new ClassLink(LinkType.CLASS, 'java.awt', 'Component');
  var linkTwo = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
  var getTopLink = Search._PackagesAndClasses._getTopLink;

  assertThat('no links, best match undefined', getTopLink([]), is(null));
  assertThat('one link, best match undefined', getTopLink([linkOne]), is(linkOne));
  assertThat('two links, best match undefined', getTopLink([linkOne, linkTwo]), is(linkOne));
  assertThat('no links, best match defined', getTopLink([], linkOne), is(linkOne));
  assertThat('one link, best match defined', getTopLink([linkOne], linkTwo), is(linkTwo));
});

/**
 * Get the best match (if any) from the given array of links.
 * @private
 */
Search._PackagesAndClasses._getBestMatch = function (searchString, links) {
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

UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getBestMatch', function () {
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
    assertThat(UnitTestSuite.quote(searchString),
           Search._PackagesAndClasses._getBestMatch(searchString, allLinks),
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

Search._PackagesAndClasses._constructHtml = function (packageAndClassLinks, bestMatch) {
  if (packageAndClassLinks.length === 0) {
    return 'No search results.';
  }
  var html = '';
  if (bestMatch && packageAndClassLinks.length > 1) {
    html += '<br/><b><i>Best Match</i></b><br/>';
    html += bestMatch.getType().getSingularName().toLowerCase();
    html += '<br/>';
    html += bestMatch.getHtml();
    html += '<br/>';
  }
  var type;
  var newType;
  packageAndClassLinks.forEach(function (link) {
    newType = link.getType();
    if (type !== newType) {
      html += '<br/><b>' + newType.getPluralName() + '</b><br/>';
      type = newType;
    }
    html += link.getHtml();
    html += '<br/>';
  });
  return html;
};


/*
 * ----------------------------------------------------------------------------
 * Search._MethodsAndKeywords
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search._MethodsAndKeywords Component of the search functionality that
 *                                   deals with method and keyword links.
 * @private
 */
Search._MethodsAndKeywords = {
  httpRequest : new HttpRequest(),

  keywords : {
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
  },

  keywordPrefixes : [
    'methods_inherited_from_',
    'fields_inherited_from_',
    'nested_classes_inherited_from_'
  ]
};

Search._MethodsAndKeywords._perform = function (searchContext, searchString) {
  var topPackageOrClassLink = searchContext.topPackageOrClassLink;
  if (searchString === null || !topPackageOrClassLink) {
    Search._MethodsAndKeywords.httpRequest.abort();
    return;
  }

  var progressCallback = function () {
    Search.perform();
  };

  var url = topPackageOrClassLink.getUrl();
  Search._MethodsAndKeywords.httpRequest.load(url, progressCallback);
  if (Search._MethodsAndKeywords.httpRequest.isComplete()) {
    var packageOrClassPageHtml = Search._MethodsAndKeywords.httpRequest.getResource();
    var methodAndKeywordLinks = this._getMethodAndKeywordLinks(url, packageOrClassPageHtml);
    var condition = RegexLibrary.createCondition(searchString);
    this._append(searchContext, topPackageOrClassLink, methodAndKeywordLinks, condition);
  } else {
    searchContext.getContentNodeHtml = function () {
      return topPackageOrClassLink.getHtml() + '<p>' + Search._MethodsAndKeywords.httpRequest.getStatusMessage() + '</p>';
    };
    searchContext.methodAndKeywordLinksLoading = true;
  }
};

Search._MethodsAndKeywords._getMethodAndKeywordLinks = function (baseUrl, packageOrClassPageHtml) {
  var names = this._getAnchorNames(packageOrClassPageHtml);
  return this._createMethodAndKeywordLinks(baseUrl, names);
};

Search._MethodsAndKeywords._getAnchorNames = function (packageOrClassPageHtml) {
  var anchorRegex = /<a name=\"([^\"]+)\"/gi;
  var matches;
  var names = [];
  while ((matches = anchorRegex.exec(packageOrClassPageHtml)) !== null) {
    names.push(matches[1]);
  }
  return names;
};

Search._MethodsAndKeywords._createMethodAndKeywordLinks = function (baseUrl, names) {
  var links = [];
  var keywordLinks = [];
  names.forEach(function (name) {
    if (Search._MethodsAndKeywords._isKeywordName(name)) {
      keywordLinks.push(new KeywordLink(baseUrl, name));
    } else {
      links.push(new MethodLink(baseUrl, name));
    }
  });
  keywordLinks.forEach(function (keywordLink) {
    links.push(keywordLink);
  });
  return links;
};

Search._MethodsAndKeywords._isKeywordName = function (name) {
  if (Search._MethodsAndKeywords.keywords[name] === 1) {
    return true;
  }
  return Search._MethodsAndKeywords.keywordPrefixes.some(function (keywordPrefix) {
    if (name.indexOf(keywordPrefix) === 0) {
      return true;
    }
  });
};

Search._MethodsAndKeywords._append = function (searchContext, topPackageOrClassLink, methodAndKeywordLinks, condition) {
  var matchingMethodAndKeywordLinks = methodAndKeywordLinks.filter(condition);
  searchContext.topMethodOrKeywordLink = matchingMethodAndKeywordLinks.length > 0 ? matchingMethodAndKeywordLinks[0] : null;

  searchContext.getContentNodeHtml = function () {
    var html = '';
    if (matchingMethodAndKeywordLinks.length === 0) {
      html += 'No search results.';
    } else {
      matchingMethodAndKeywordLinks.forEach(function (methodOrKeywordLink) {
        html += methodOrKeywordLink.getHtml();
      });
    }
    return topPackageOrClassLink.getHtml() + '<p>' + html + '</p>';
  };
};


/*
 * ----------------------------------------------------------------------------
 * Search._Menu
 * ----------------------------------------------------------------------------
 */

/**
 * @class Search._Menu Component of the search functionality that deals with
 *                     the package menu and class menu.
 * @private
 */
Search._Menu = {
  menuReplacement : null
};

Search._Menu._perform = function (searchContext, searchString) {
  var topPackageOrClassLink = searchContext.topPackageOrClassLink;
  var topMethodOrKeywordLink = searchContext.topMethodOrKeywordLink;

  var performMenuSearch = searchString !== null && topPackageOrClassLink &&
      !searchContext.methodAndKeywordLinksLoading && topMethodOrKeywordLink !== null;
  if (!performMenuSearch) {
    return;
  }

  var menuHtml = this._constructMenuHtml(searchContext, topPackageOrClassLink, topMethodOrKeywordLink);
  searchContext.getContentNodeHtml = function () {
    var html = topPackageOrClassLink.getHtml();
    if (topMethodOrKeywordLink) {
      html += '<br/>' + topMethodOrKeywordLink.getHtml();
    }
    html += '<p>' + menuHtml + '</p>';
    return html;
  };

  if (!searchString) {
    return;
  }

  var node = document.createElement('p');
  node.innerHTML = menuHtml;
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
      Frames.openLinkInNewTab(anchorNode.getAttribute('href'));
      break;
    }
  }
  document.body.removeChild(node);
};

Search._Menu._constructMenuHtml = function (searchContext, classOrPackageLink, methodOrKeywordLink) {
  var methodLink;
  if (methodOrKeywordLink &&
      methodOrKeywordLink.getType() === LinkType.METHOD) {
    methodLink = methodOrKeywordLink;
  };

  var menu;
  if (classOrPackageLink && classOrPackageLink.getType() === LinkType.PACKAGE) {
    menu = searchContext.packageMenu;
  } else {
    menu = searchContext.classMenu;
  }

  var menuHtml = '';
  var menuReplacement = this._getMenuReplacement();
  menu.split('\n').forEach(function (menuAnchorDefinition) {
    var labelAndHtml = menuAnchorDefinition.split('->');
    var menuAnchorLabel = labelAndHtml[0];
    var menuAnchorHref = labelAndHtml[1];
    if (labelAndHtml.length === 2) {
      var matches;
      while ((matches = /##(\w+)##/.exec(menuAnchorHref)) !== null) {
        var f = menuReplacement[matches[1]];
        var rx2 = new RegExp(matches[0], 'g');
        if (f) {
          menuAnchorHref = menuAnchorHref.replace(rx2, f(classOrPackageLink, methodLink));
        } else {
          menuAnchorHref = menuAnchorHref.replace(rx2, '');
        }
      }
      menuHtml +='<a href="' + menuAnchorHref + '">' + menuAnchorLabel + '</a><br/>';
    }
  });

  return menuHtml;
};

/**
 * Placeholder values that can be entered into the class_menu or package_menu
 * options and will, when the menu is opened, be replaced with data relevant
 * to the current package or class.
 * @private
 */
Search._Menu._getMenuReplacement = function () {
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
      METHOD_NAME: function (classOrPackageLink, methodLink) {
        return methodLink ? methodLink.getMethodName() : '';
      },
      ANCHOR_NAME: function (classOrPackageLink, methodLink) {
        // This is a deprecated alternative to METHOD_NAME.
        return methodLink ? methodLink.getMethodName() : '';
      }
    };
  }
  return this.menuReplacement;
};


/*
 * ----------------------------------------------------------------------------
 * Main script
 * ----------------------------------------------------------------------------
 */

/**
 * Initialise this script.
 * @param unitTestResultsCallback function that is called with the unit test
 *                                results once the script has been initialised
 */
function init(unitTestResultsCallback) {

  Option.HIDE_PACKAGE_FRAME.getValue(function (hidePackageFrame) {

    // Retrieve the inner HTML of the class frame.
    var classesInnerHtml = getClassesInnerHtml();

    // Initialise stored package and class links.
    var classLinks = getClassLinks(classesInnerHtml);
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
    Search.perform();

    // Run the unit test.
    var unitTestResults = UnitTestSuite.run();

    // Hide the package list frame.
    if (hidePackageFrame) {
      Frames.hideAllPackagesFrame();
    }

    // Give focus to the search field.
    View.focusOnSearchField();

    // Provide the unit test results to the callback function.
    unitTestResultsCallback(unitTestResults);

  });
}

/**
 * Parse packages from the given array of {@ClassLink} objects.
 * 
 * @param classLinks
 * @returns an array of {@PackageLink} objects
 */
function getPackageLinks(classLinks) {
  var packageLinks = [];
  var packageLinksAdded = {};
  var packageName;

  classLinks.forEach(function (classLink) {
    packageName = classLink.getPackageName();
    if (!packageLinksAdded[packageName]) {
      packageLinks.push(new PackageLink(packageName));
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

UnitTestSuite.testFunctionFor('getPackageLinks', function () {

  var classLinks = [
      new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder'),
      new ClassLink(LinkType.CLASS, 'java.awt', 'Button'),
      new ClassLink(LinkType.CLASS, 'javax.swing', 'SwingWorker')
  ];

  var expectedPackageLinks = [
      new PackageLink('java.awt'),
      new PackageLink('javax.swing'),
      new PackageLink('javax.swing.border')
  ];

  assertThat('getPackageLinks([javax.swing.border.AbstractBorder, java.awt.Button, javax.swing.SwingWorker])',
      getPackageLinks(classLinks), is(expectedPackageLinks));
});

/**
 * @returns the inner HTML of the body element of the classes list frame, or undefined if the element does not exist
 */
function getClassesInnerHtml() {
  var classesInnerHtml;
  if (document && document.body) {
    classesInnerHtml = document.body.innerHTML;
  }
  return classesInnerHtml;
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
 * @param classesInnerHtml the inner HTML of the body element of the classes
 *                         list frame
 * @returns an array of {@link ClassLink} objects
 */
function getClassLinks(classesInnerHtml) {
  if (!classesInnerHtml) {
    return [];
  }

  var cl;
  var matches;

  var classLinksMap = {};
  LinkType.forEach(function (type) {
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
  while ((matches = classesRegexWithTitle.exec(classesInnerHtml)) !== null) {
    var typeInTitle = matches[1];
    var packageName = matches[2];
    var className = trimFromEnd(matches[3]);
    var type = LinkType.getByName(typeInTitle);
    type = checkForExceptionOrErrorType(type, className);

    cl = new ClassLink(type, packageName, className);
    classLinksMap[type].push(cl);
    anchorWithTitleFound = true;
  }

  if (!anchorWithTitleFound) {
    var classesWithoutTitleRegex =
        /<a\s+href\s*=\s*\"([^\"]+)(?:\/|\\)[^\"]+\"[^>]*>(\s*<i\s*>)?\s*([^<]+)(?:<\/i\s*>\s*)?<\/a\s*>/gi;
    while ((matches = classesWithoutTitleRegex.exec(classesInnerHtml)) !== null) {
      var packageName = matches[1].replace(/\/|\\/g, '.');
      var openingItalicTag = matches[2];
      var className = trimFromEnd(matches[3]);
      var type = openingItalicTag ? LinkType.INTERFACE : LinkType.CLASS;
      type = checkForExceptionOrErrorType(type, className);

      cl = new ClassLink(type, packageName, className);
      classLinksMap[type].push(cl);
    }
  }

  var classLinks = [];
  LinkType.forEach(function (type) {
    classLinks = classLinks.concat(classLinksMap[type]);
  });
  return classLinks;
}

UnitTestSuite.testFunctionFor('getClassLinks', function () {

  function assert(args, html, description) {
    var link = new ClassLink(args.type, args.package, args.class);
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

/**
 * Determine whether stringOne ends with stringTwo.
 * @param stringOne
 * @param stringTwo
 * @returns true if stringOne ends with stringTwo, false otherwise
 */
function endsWith(stringOne, stringTwo) {
  if (!stringOne) {
    return false;
  }
  var strIndex = stringOne.length - stringTwo.length;
  return strIndex >= 0 && stringOne.substring(strIndex) === stringTwo;
}

UnitTestSuite.testFunctionFor('endsWith', function () {

  var assertThatEndsWith = function (stringOne, stringTwo, expectedResult) {
    assertThat(
        UnitTestSuite.quote(stringOne) + ' ends with ' + UnitTestSuite.quote(stringTwo)+ ':',
        endsWith(stringOne, stringTwo),
        expectedResult);
  };

  assertThatEndsWith(undefined, '', is(false));
  assertThatEndsWith(null, '', is(false));
  assertThatEndsWith('one', 'onetwo', is(false));
  assertThatEndsWith('one', 'one', is(true));
  assertThatEndsWith('one', 'e', is(true));
  assertThatEndsWith('', 'two', is(false));
});

/**
 * Trim whitespace from the end of the given string.
 * @param stringToTrim the string to trim
 * @returns the trimmed string
 */
function trimFromEnd(stringToTrim) {
  return stringToTrim.replace(/\s+$/, '');
}

UnitTestSuite.testFunctionFor('trimFromEnd', function () {

  var assertThatTrimFromEnd = function (stringToTrim, expectedResult) {
    assertThat(UnitTestSuite.quote(stringToTrim), trimFromEnd(stringToTrim), expectedResult);
  };

  assertThatTrimFromEnd('string', is('string'));
  assertThatTrimFromEnd('string   ', is('string'));
  assertThatTrimFromEnd('   string', is('   string'));
  assertThatTrimFromEnd('   string   ', is('   string'));
});


/*
 * ----------------------------------------------------------------------------
 * EventHandlers
 * ----------------------------------------------------------------------------
 */

/**
 * @class EventHandlers Called by the view to handle UI events.
 */
EventHandlers = {};

/**
 * Called when a key has been pressed while the search field has focus.
 * @param evt
 */
EventHandlers.searchFieldKeyup = function (evt) {
  var code = evt.keyCode;
  if (code === 13) {
    EventHandlers._returnKeyPressed(evt.ctrlKey);
  } else if (code === 27) {
    EventHandlers._escapeKeyPressed();
  }
};

/**
 * Called when the contents of the search field has changed.
 */
EventHandlers.searchFieldChanged = function () {
  var searchFieldContents = View.getSearchFieldValue();
  Query.update(searchFieldContents);
  Search.performIfSearchStringHasChanged();
};

/**
 * Called when the search field has gained focus.
 */
EventHandlers.searchFieldFocus = function () {
  document.body.scrollLeft = 0;
};

/**
 * Caled when the erase button has been clicked.
 */
EventHandlers.eraseButtonClick = function () {
  Query.update('');
  View.focusOnSearchField();
  Search.performIfSearchStringHasChanged();
};

/**
 * Called when the Options link has been clicked.
 * @param evt
 */
EventHandlers.optionsLinkClicked = function (evt) {
  OptionsPage.open();
  evt.preventDefault();
};

/**
 * Called when the return key has been pressed while the search field has
 * focus.
 * @param ctrlModifier true if the CTRL key was held down when the return key
 *                     was pressed, false otherwise
 * @private
 */
EventHandlers._returnKeyPressed = function (ctrlModifier) {
  var searchFieldValue = View.getSearchFieldValue();
  Query.update(searchFieldValue);
  Search.performIfSearchStringHasChanged();

  var url = Search.getTopLinkUrl();
  if (url) {
    if (ctrlModifier) {
      window.open(url);
    } else {
      Frames.openLinkInSummaryFrame(url);
    }
  }
};

/**
 * Called when the escape key has been pressed while the search field has
 * focus.
 * @private
 */
EventHandlers._escapeKeyPressed = function () {
  var searchFieldValue = View.getSearchFieldValue();
  if (searchFieldValue) {
    Query.update('');
    Search.performIfSearchStringHasChanged();
  }
};
