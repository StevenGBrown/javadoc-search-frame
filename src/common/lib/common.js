/**
 * The MIT License
 *
 * Copyright (c) 2011 Steven G. Brown
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
 * @type {Array.<PackageLink|ClassLink>}
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
  unitTestFunctions: []
};


/**
 * Add a test function to this suite.
 * @param {string} functionUnderTest The name of the function under test.
 * @param {function()} unitTestFunction The test function.
 */
UnitTestSuite.testFunctionFor = function(functionUnderTest, unitTestFunction) {
  UnitTestSuite.unitTestFunctions.push(
      {name: functionUnderTest, run: unitTestFunction});
};


/**
 * Run all of the test functions that have been added to this suite.
 * @return {UnitTestResult} The result of running this suite.
 */
UnitTestSuite.run = function() {
  UnitTestSuite.assertionsCount = 0;
  UnitTestSuite.failures = [];

  var iteration = function(unitTestFunction) {
    UnitTestSuite.unitTestFunctionName = unitTestFunction.name;
    try {
      unitTestFunction.run();
    } catch (ex) {
      this.failures.push(
          new UnitTestExceptionThrownFailure(
              UnitTestSuite.unitTestFunctionName, ex));
    }
  };

  UnitTestSuite.unitTestFunctions.forEach(iteration, UnitTestSuite);
  return new UnitTestResult(
      UnitTestSuite.assertionsCount, UnitTestSuite.failures);
};


/**
 * Assert that the actual value equals the expected value.
 * @param {string} description A description of the assertion.
 * @param {*} actual The actual value.
 * @param {*} expected The expected value.
 */
UnitTestSuite.assertThat = function(description, actual, expected) {
  if (!UnitTestSuite._equals(expected, actual)) {
    var failure = new UnitTestAssertionFailure(
        UnitTestSuite.unitTestFunctionName, description, actual, expected);
    UnitTestSuite.failures.push(failure);
  }
  UnitTestSuite.assertionsCount++;
};


/**
 * Has no effect; intended to make calls to the {@link UnitTestSuite.assertThat}
 * and {@link UnitTestSuite.assertThatEval} functions more readable.
 * <p>
 * Example: assertThat(theSky, is(blue));
 * @param {*} value Any value.
 * @return {*} The value paramter (unchanged).
 */
UnitTestSuite.is = function(value) {
  return value;
};


/**
 * Quotes the given string value in the same way as the Console or Error Log.
 * @param {string} stringValue The string value.
 * @return {string} The quoted string.
 */
UnitTestSuite.quote = function(stringValue) {
  if (stringValue || stringValue === '') {
    return '\'' + stringValue + '\'';
  }
  return stringValue;
};


/**
 * Used by the {@link UnitTestSuite} assertion functions to determine if two
 * objects are equal.
 * @param {*} one The first object.
 * @param {*} two The second object.
 * @return {boolean} Whether the two objects are equal.
 */
UnitTestSuite._equals = function(one, two) {
  if (one instanceof Array && two instanceof Array) {
    if (one.length !== two.length) {
      return false;
    }
    var equalsFunction = arguments.callee;
    return one.every(function(oneItem, index) {
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
 * calls through to a function of the same name declared on the {UnitTestSuite}
 * object.
 */


/**
 */
var assertThat = UnitTestSuite.assertThat;


/**
 */
var assertThatEval = UnitTestSuite.assertThatEval;


/**
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
 * Unit test result returned by {@link UnitTestSuite#run}.
 * @param {number} numberOfAssertions The total number of unit test assertions.
 * @param {Array.<UnitTestAssertionFailure|UnitTestExceptionThrownFailure>}
 *     failures The assertion failures.
 * @constructor
 */
UnitTestResult = function(numberOfAssertions, failures) {
  this.numberOfAssertions = numberOfAssertions;
  this.failures = failures;
};


/**
 * @return {string} A description of this unit test result.
 */
UnitTestResult.prototype.toString = function() {
  var result = '';
  if (this.failures.length >= 1) {
    result += 'Unit test FAILED: ';
  }
  result +=
      this.numberOfAssertions - this.failures.length +
      ' of ' +
      this.numberOfAssertions +
      ' unit test assertions passed.\n';
  this.failures.forEach(function(unitTestFailure) {
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
 * A unit test failure due to a failed assertion.
 * @param {string} functionUnderTestName The name of the function under test.
 * @param {string} description The description of the test case.
 * @param {*} actual The actual value.
 * @param {*} expected The expected value.
 * @constructor
 */
UnitTestAssertionFailure = function(
    functionUnderTestName, description, actual, expected) {
  this.functionUnderTestName = functionUnderTestName;
  this.description = description;
  this.actual = actual;
  this.expected = expected;
};


/**
 * @return {string} A description of this unit test failure.
 */
UnitTestAssertionFailure.prototype.toString = function() {
  var failureString = this.functionUnderTestName + '\n';
  if (this.description) {
    failureString += this.description + '\n';
  }
  failureString += 'Expected "' + this.expected + '"' +
                   ' but was "' + this.actual + '"';
  return failureString;
};


/*
 * ----------------------------------------------------------------------------
 * UnitTestExceptionThrownFailure
 * ----------------------------------------------------------------------------
 */



/**
 * A unit test failure due to a thrown exception.
 * @param {string} functionUnderTestName The name of the function under test.
 * @param {*} exception The exception that was thrown.
 * @constructor
 */
UnitTestExceptionThrownFailure = function(functionUnderTestName, exception) {
  this.functionUnderTestName = functionUnderTestName;
  this.exception = exception;
};


/**
 * @return {string} A description of this unit test failure.
 */
UnitTestExceptionThrownFailure.prototype.toString = function() {
  return this.functionUnderTestName + '\n' + this.exception;
};


/*
 * ----------------------------------------------------------------------------
 * LinkType
 * ----------------------------------------------------------------------------
 */



/**
 * Package, class, class member and keyword link types.
 * @param {string} singularName The singular name of the link type.
 * @param {string} pluralName The plural name of the link type.
 * @constructor
 */
LinkType = function(singularName, pluralName) {
  this.singularName = singularName;
  this.pluralName = pluralName;
};


/**
 * @return {string} The singular name of this type.
 */
LinkType.prototype.getSingularName = function() {
  return this.singularName;
};


/**
 * @return {string} The plural name of this type.
 */
LinkType.prototype.getPluralName = function() {
  return this.pluralName;
};


/**
 * @return {string} A string representation of this type.
 */
LinkType.prototype.toString = function() {
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
 * Class member link type.
 */
LinkType.CLASS_MEMBER = new LinkType('Method or Field', 'Methods and Fields');


/**
 * Keyword link type.
 */
LinkType.KEYWORD = new LinkType('Keyword', 'Keywords');


/**
 * Get the link type with the given singular name.
 * @param {string} singularName The singular name.
 * @return {LinkType} The link type.
 */
LinkType.getByName = function(singularName) {
  return LinkType[singularName.toUpperCase()];
};


/*
 * ----------------------------------------------------------------------------
 * PackageLink, ClassLink, MemberLink and KeywordLink
 * ----------------------------------------------------------------------------
 */


/**
 * Extract a URL from the given link.
 * @param {PackageLink|ClassLink|MemberLink|KeywordLink} link The link.
 * @return {string} The URL.
 */
function extractUrl(link) {
  var html = link.getHtml();
  // Assume that the HTML starts with <A HREF="..."
  var firstQuoteIndex = html.indexOf('"');
  var secondQuoteIndex = html.indexOf('"', firstQuoteIndex + 1);
  return html.substring(firstQuoteIndex + 1, secondQuoteIndex);
}

UnitTestSuite.testFunctionFor('extractUrl', function() {
  var mockLink = {};
  mockLink.getHtml = function() {
    return '<A HREF="urlOfLink"';
  };
  assertThat('', extractUrl(mockLink), is('urlOfLink'));
});


/**
 * Convert the given relative URL to an absolute URL.
 * @param {string} relativeUrl The relative URL.
 * @param {string=} opt_documentUrl The document's current URL, given by
 *     location.href (optional).
 * @return {string} The absolute URL.
 */
function toAbsoluteUrl(relativeUrl, opt_documentUrl) {
  var colonIndex = relativeUrl.indexOf(':');
  if (colonIndex != -1 && colonIndex < relativeUrl.indexOf('/')) {
    // Already an absolute URL.
    return relativeUrl;
  }
  if (!opt_documentUrl) {
    opt_documentUrl = location.href;
  }
  var documentUrlPath = opt_documentUrl.substring(
      0, opt_documentUrl.lastIndexOf('/') + 1);
  var relativeUrlPath = relativeUrl.substring(
      0, relativeUrl.lastIndexOf('/') + 1);
  if (endsWith(documentUrlPath, relativeUrlPath)) {
    documentUrlPath = documentUrlPath.substring(
        0, documentUrlPath.length - relativeUrlPath.length);
  }
  return documentUrlPath + relativeUrl;
}

UnitTestSuite.testFunctionFor('toAbsoluteUrl', function() {
  var api = 'http://java.sun.com/javase/6/docs/api/';
  assertThat('relative to "all classes" url', toAbsoluteUrl(
      'java/applet/AppletContext.html', api + 'allclasses-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
  assertThat('relative to package url', toAbsoluteUrl(
      'java/applet/AppletContext.html', api + 'java/applet/package-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
  assertThat('already an absolute url', toAbsoluteUrl(
      api + 'java/applet/AppletContext.html', api + 'allclasses-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
});



/**
 * Link to a package. These links are of type {LinkType.PACKAGE}.
 * @param {string} packageName The package name.
 * @constructor
 */
PackageLink = function(packageName) {
  this.packageName = packageName;
  this.html = '<A HREF="' + packageName.replace(/\./g, '/') +
      '/package-summary.html" target="classFrame">' + packageName + '</A>';
};


/**
 * Determine whether this link matches the given regular expression.
 * @param {RegExp} regex The regular expression.
 * @return {boolean} Whether this link is a match.
 */
PackageLink.prototype.matches = function(regex) {
  return regex.test(this.packageName);
};


/**
 * @return {string} This link in HTML format.
 */
PackageLink.prototype.getHtml = function() {
  return this.html;
};

UnitTestSuite.testFunctionFor('PackageLink.getHtml', function() {
  assertThat('', new PackageLink('java.applet').getHtml(), is(
      '<A HREF="java/applet/package-summary.html" target="classFrame">' +
      'java.applet</A>'));
});


/**
 * @return {LinkType} The type of this link.
 */
PackageLink.prototype.getType = function() {
  return LinkType.PACKAGE;
};


/**
 * @return {string} The name of this package.
 */
PackageLink.prototype.getPackageName = function() {
  return this.packageName;
};


/**
 * @return {string} The URL of this link.
 */
PackageLink.prototype.getUrl = function() {
  return toAbsoluteUrl(extractUrl(this));
};

UnitTestSuite.testFunctionFor('PackageLink.getUrl', function() {
  assertThat('', new PackageLink('java.applet').getUrl(),
      is(toAbsoluteUrl('java/applet/package-summary.html')));
});


/**
 * Equals function.
 * @param {*} obj The object with which to compare.
 * @return {boolean} Whether this link is equal to the given object.
 */
PackageLink.prototype.equals = function(obj) {
  return obj instanceof PackageLink &&
      this.packageName === obj.packageName;
};


/**
 * @return {string} A string representation of this link.
 */
PackageLink.prototype.toString = function() {
  return this.packageName;
};



/**
 * Link to a class. These links are of type {LinkType.INTERFACE},
 * {LinkType.CLASS}, {LinkType.ENUM}, {LinkType.EXCEPTION}, {LinkType.ERROR} or
 * {LinkType.ANNOTATION}.
 * @param {LinkType} type The type of this link.
 * @param {string} packageName The package name.
 * @param {string} className The class name.
 * @constructor
 */
ClassLink = function(type, packageName, className) {
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

  var url = toAbsoluteUrl(packageName.replace(/\./g, '/') + '/' + className +
      '.html');
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
  this.html = '<A HREF="' + url + '" title="' +
      typeInHtml.getSingularName().toLowerCase() + ' in ' + packageName +
      '" target="classFrame">' + openingTag + className + closingTag +
      '</A>&nbsp;[&nbsp;' + packageName + '&nbsp;]';
};


/**
 * Determine whether this link matches the given regular expression.
 * @param {RegExp} regex The regular expression.
 * @return {boolean} Whether this link is a match.
 */
ClassLink.prototype.matches = function(regex) {
  return regex.test(this.className) || regex.test(this.canonicalName) ||
      this.innerClassNames.some(function(innerClassName) {
        return regex.test(innerClassName);
      });
};


/**
 * @return {string} This link in HTML format.
 */
ClassLink.prototype.getHtml = function() {
  return this.html;
};

UnitTestSuite.testFunctionFor('ClassLink.getHtml', function() {
  var url = toAbsoluteUrl;
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext').getHtml(), is(
      '<A HREF="' +
      url('javax/swing/text/AbstractDocument.AttributeContext.html') +
      '" title="interface in javax.swing.text" target="classFrame"><I>' +
      'AbstractDocument.AttributeContext</I></A>&nbsp;[&nbsp;' +
      'javax.swing.text&nbsp;]'));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util',
      'AbstractAnnotationValueVisitor6').getHtml(), is(
      '<A HREF="' +
      url('javax/lang/model/util/AbstractAnnotationValueVisitor6.html') +
      '" title="class in javax.lang.model.util" target="classFrame">' +
      'AbstractAnnotationValueVisitor6</A>&nbsp;[&nbsp;javax.lang.model.util' +
      '&nbsp;]'));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang',
      'Thread.State').getHtml(), is(
      '<A HREF="' +
      url('java/lang/Thread.State.html') +
      '" title="enum in java.lang" ' +
      'target="classFrame">Thread.State</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException').getHtml(), is(
      '<A HREF="' +
      url('java/security/AccessControlException.html') +
      '" title="class in java.security" target="classFrame">' +
      'AccessControlException</A>&nbsp;[&nbsp;java.security&nbsp;]'));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation',
      'AnnotationFormatError').getHtml(), is(
      '<A HREF="' +
      url('java/lang/annotation/AnnotationFormatError.html') +
      '" title="class in java.lang.annotation" target="classFrame">' +
      'AnnotationFormatError</A>&nbsp;[&nbsp;java.lang.annotation&nbsp;]'));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang',
      'Deprecated').getHtml(), is(
      '<A HREF="' +
      url('java/lang/Deprecated.html') +
      '" title="annotation in java.lang" ' +
      'target="classFrame">Deprecated</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
});


/**
 * @return {LinkType} The type of this link.
 */
ClassLink.prototype.getType = function() {
  return this.type;
};


/**
 * @return {string} The simple name of this class.
 */
ClassLink.prototype.getClassName = function() {
  return this.className;
};


/**
 * @return {string} The name of the package that contains this class.
 */
ClassLink.prototype.getPackageName = function() {
  return this.canonicalName.substring(
      0, this.canonicalName.length - this.className.length - 1);
};


/**
 * @return {string} The canonical name of this class.
 */
ClassLink.prototype.getCanonicalName = function() {
  return this.canonicalName;
};


/**
 * @return {string} The URL of this link.
 */
ClassLink.prototype.getUrl = function() {
  return toAbsoluteUrl(extractUrl(this));
};

UnitTestSuite.testFunctionFor('ClassLink.getUrl', function() {
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext').getUrl(), is(toAbsoluteUrl(
      'javax/swing/text/AbstractDocument.AttributeContext.html')));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util',
      'AbstractAnnotationValueVisitor6').getUrl(), is(toAbsoluteUrl(
      'javax/lang/model/util/AbstractAnnotationValueVisitor6.html')));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang',
      'Thread.State').getUrl(), is(toAbsoluteUrl(
      'java/lang/Thread.State.html')));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException').getUrl(), is(toAbsoluteUrl(
      'java/security/AccessControlException.html')));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation',
      'AnnotationFormatError').getUrl(), is(toAbsoluteUrl(
      'java/lang/annotation/AnnotationFormatError.html')));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang',
      'Deprecated').getUrl(), is(toAbsoluteUrl('java/lang/Deprecated.html')));
});


/**
 * Equals function.
 * @param {*} obj The object with which to compare.
 * @return {boolean} Whether this link is equal to the given object.
 */
ClassLink.prototype.equals = function(obj) {
  return obj instanceof ClassLink &&
      this.type === obj.type &&
      this.className === obj.className &&
      this.canonicalName === obj.canonicalName;
};


/**
 * @return {string} A string representation of this link.
 */
ClassLink.prototype.toString = function() {
  return this.canonicalName;
};



/**
 * Link to a method or field of a class.
 * @param {string} baseUrl The base URL of this link.
 * @param {string} name The method or field name.
 * @constructor
 */
MemberLink = function(baseUrl, name) {
  this.name = name;
  this.html = '<A HREF="' + baseUrl + '#' + name +
      '" target="classFrame" class="anchorLink">' +
      name.replace(/ /g, '&nbsp;') + '</A><BR/>';
};


/**
 * Determine whether this link matches the given regular expression.
 * @param {RegExp} regex The regular expression.
 * @return {boolean} Whether this link is a match.
 */
MemberLink.prototype.matches = function(regex) {
  return regex.test(this.name);
};


/**
 * @return {string} This link in HTML format.
 */
MemberLink.prototype.getHtml = function() {
  return this.html;
};


/**
 * @return {LinkType} The type of this link.
 */
MemberLink.prototype.getType = function() {
  return LinkType.CLASS_MEMBER;
};


/**
 * @return {string} The URL of this link.
 */
MemberLink.prototype.getUrl = function() {
  return extractUrl(this);
};


/**
 * @return {string} The name of this class member.
 */
MemberLink.prototype.getName = function() {
  if (this.name.indexOf('(') !== -1) {
    return this.name.substring(0, this.name.indexOf('('));
  } else {
    return this.name;
  }
};



/**
 * Keyword link found on a package or class page.
 * @param {string} baseUrl The base URL of this link.
 * @param {string} name The keyword name.
 * @constructor
 */
KeywordLink = function(baseUrl, name) {
  this.name = name;
  this.html = '<A HREF="' + baseUrl + '#' + name +
      '" target="classFrame" class="anchorLink" style="color:#666">' +
      name.replace(/ /g, '&nbsp;') + '</A><BR/>';
};


/**
 * Determine whether this link matches the given regular expression.
 * @param {RegExp} regex The regular expression.
 * @return {boolean} Whether this link is a match.
 */
KeywordLink.prototype.matches = function(regex) {
  return regex.test(this.name);
};


/**
 * @return {string} This link in HTML format.
 */
KeywordLink.prototype.getHtml = function() {
  return this.html;
};


/**
 * @return {LinkType} The type of this link.
 */
KeywordLink.prototype.getType = function() {
  return LinkType.KEYWORD;
};


/**
 * @return {string} The URL of this link.
 */
KeywordLink.prototype.getUrl = function() {
  return extractUrl(this);
};


/*
 * ----------------------------------------------------------------------------
 * View
 * ----------------------------------------------------------------------------
 */


/**
 * @class View Provides access to the UI elements of the frame containing the
 *     search field.
 */
View = {
  searchField: null,
  contentNodeParent: null,
  contentNode: null
};


/**
 * Access key that will focus on the search field when activated ('s').
 * This access key can be activated by pressing either Alt+s or Alt+Shift+s,
 * depending on the internet browser.
 * @type {string}
 */
View.searchAccessKey = 's';


/**
 * Access key that will clear the search field when activated ('a').
 * This access key can be activated by pressing either Alt+a or Alt+Shift+a,
 * depending on the internet browser.
 * @type {string}
 */
View.eraseAccessKey = 'a';


/**
 * Initialise the search field frame.
 * @param {EventHandlers} eventHandlers The event handlers.
 */
View.initialise = function(eventHandlers) {
  View._create(eventHandlers);
};


/**
 * Set the HTML contents of the area below the search field.
 * @param {string} contents The HTML contents.
 */
View.setContentsHtml = function(contents) {
  var newNode = View.contentNode.cloneNode(false);
  newNode.innerHTML = contents;
  View.contentNodeParent.replaceChild(newNode, View.contentNode);
  View.contentNode = newNode;
};


/**
 * Set the value displayed in the search field.
 * @param {string} value The value to display.
 */
View.setSearchFieldValue = function(value) {
  if (View.searchField.value !== value) {
    View.searchField.value = value;
  }
};


/**
 * @return {string} The current value displayed in the search field.
 */
View.getSearchFieldValue = function() {
  return View.searchField.value;
};


/**
 * Give focus to the search field.
 */
View.focusOnSearchField = function() {
  View.searchField.focus();
};


/**
 * Create the view elements and add them to the current document.
 * @param {EventHandlers} eventHandlers The event handlers.
 */
View._create = function(eventHandlers) {
  var tableElement = document.createElement('table');
  var tableRowElementOne = document.createElement('tr');
  var tableDataCellElementOne = document.createElement('td');
  var tableRowElementTwo = document.createElement('tr');
  var tableDataCellElementTwo = document.createElement('td');

  View.searchField = View._createSearchField(eventHandlers);
  var webKitBrowser = RegExp(' AppleWebKit/').test(navigator.userAgent);
  if (View.searchField.type === 'text' || !webKitBrowser) {
    // Three cases:
    // 1) WebKit browsers, e.g. Google Chrome and Safari, will display an
    //    erase button on type="search" input fields once some text has been
    //    entered into the field. Do not manually add an erase button.
    // 2) If searchType.type === 'text', this is a pre-HTML5 browser that is
    //    unaware of the search type. Manually add an erase button.
    // 3) HTML5-aware versions of Mozilla Firefox will report that
    //    searchType.type is 'search', but will not change the behaviour of the
    //    field. Manually add an erase button.
    var eraseButton = View._createEraseButton(eventHandlers);
  }
  var optionsLink = View._createOptionsLink(eventHandlers);
  View.contentNodeParent = tableRowElementTwo;
  View.contentNode = tableDataCellElementTwo;

  tableElement.appendChild(tableRowElementOne);
  tableRowElementOne.appendChild(tableDataCellElementOne);
  tableDataCellElementOne.appendChild(View.searchField);
  if (eraseButton) {
    tableDataCellElementOne.appendChild(eraseButton);
  }
  tableDataCellElementOne.appendChild(document.createElement('br'));
  tableDataCellElementOne.appendChild(optionsLink);
  tableElement.appendChild(tableRowElementTwo);
  tableRowElementTwo.appendChild(tableDataCellElementTwo);

  [tableElement, tableRowElementOne, tableDataCellElementOne,
   tableRowElementTwo, tableDataCellElementTwo].forEach(function(element) {
    element.style.border = '0';
    element.style.width = '100%';
  });

  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  document.body.appendChild(tableElement);
};


/**
 * @param {EventHandlers} eventHandlers The event handlers.
 * @return {Element} The search field element.
 */
View._createSearchField = function(eventHandlers) {
  var searchField = document.createElement('input');
  searchField.setAttribute('type', 'search');
  searchField.setAttribute('spellcheck', 'false');
  searchField.setAttribute('autofocus', 'true');
  searchField.addEventListener('keyup', eventHandlers.searchFieldKeyup, false);
  searchField.addEventListener(
      'input', eventHandlers.searchFieldChanged, false);
  searchField.addEventListener('focus', eventHandlers.searchFieldFocus, false);
  if (View.searchAccessKey) {
    searchField.setAttribute('accesskey', View.searchAccessKey);
  }
  return searchField;
};


/**
 * @param {EventHandlers} eventHandlers The event handlers.
 * @return {Element} The erase button element.
 */
View._createEraseButton = function(eventHandlers) {
  var eraseButton = document.createElement('input');
  eraseButton.setAttribute('type', 'image');
  eraseButton.setAttribute('src', 'data:image/gif;base64,' +
      'R0lGODlhDQANAJEDAM%2FPz%2F%2F%2F%2F93d3UpihSH5BAEAAAMALAAAAAANAA0AAAI' +
      'wnCegcpcg4nIw2sRGDZYnBAWiIHJQRZbec5XXEqnrmXIupMWdZGCXlAGhJg0h7lAAADs%' +
      '3D');
  eraseButton.setAttribute('style', 'margin-left: 2px');
  eraseButton.addEventListener('click', eventHandlers.eraseButtonClick, false);
  if (View.eraseAccessKey) {
    eraseButton.setAttribute('accesskey', View.eraseAccessKey);
  }
  return eraseButton;
};


/**
 * @param {EventHandlers} eventHandlers The event handlers.
 * @return {Element} The options page link element.
 */
View._createOptionsLink = function(eventHandlers) {
  var anchorElement = document.createElement('a');
  anchorElement.setAttribute('href', 'javascript:void(0);');
  anchorElement.textContent = Messages.get('optionsAnchor');
  anchorElement.addEventListener(
      'click', eventHandlers.optionsLinkClicked, false);
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
 *     query.
 */
Query = {
  packageOrClassSearchString: '',
  memberOrKeywordSearchString: null,
  menuSearchString: null,
  timeoutId: null
};


/**
 * @return {string} The portion of the search query that relates to the
 *     packages and classes search.
 */
Query.getPackageOrClassSearchString = function() {
  return Query.packageOrClassSearchString;
};


/**
 * @return {string} The portion of the search query that relates to the class
 *     members and keywords search.
 */
Query.getMemberOrKeywordSearchString = function() {
  return Query.memberOrKeywordSearchString;
};


/**
 * @return {string} The portion of the search query that relates to the
 *     package menu or class menu.
 */
Query.getMenuSearchString = function() {
  return Query.menuSearchString;
};


/**
 * @return {string} The entire search query.
 */
Query.getEntireSearchString = function() {
  var searchString = Query.packageOrClassSearchString;
  if (Query.memberOrKeywordSearchString !== null) {
    searchString += '#';
    searchString += Query.memberOrKeywordSearchString;
  }
  if (Query.menuSearchString !== null) {
    searchString += '@';
    searchString += Query.menuSearchString;
  }
  return searchString;
};


/**
 * Update this query based on the contents of the search field.
 * @param {string} searchFieldContents The contents of the search field.
 */
Query.update = function(searchFieldContents) {
  Query._processInput(searchFieldContents);

  /*
   * Update the view on a timer (see r204) as a workaround for a Webkit bug:
   * https://bugs.webkit.org/show_bug.cgi?id=34374
   *
   * This workaround is no longer necessary since at least Google Chrome
   * 12.0.742.112 and Safari 5.1.
   *
   * However, it shouldn't be removed, because the script may be running under
   * an older version of Safari. This isn't a problem for Google Chrome, which
   * will only install extensions that are compatible with the browser version.
   */
  if (Query.timeoutId !== null) {
    clearTimeout(Query.timeoutId);
  }
  Query.timeoutId = setTimeout(function() {
    Query._updateView.apply(Query);
  }, 0);
};


/**
 * Process the search field input.
 * @param {string} searchFieldContents The contents of the search field.
 */
Query._processInput = function(searchFieldContents) {
  var searchString;
  if (Query.menuSearchString !== null) {
    searchString = Query.packageOrClassSearchString;
    if (Query.memberOrKeywordSearchString !== null) {
      searchString += '#' + Query.memberOrKeywordSearchString;
    }
    if (searchFieldContents.indexOf('@') !== -1) {
      searchString += searchFieldContents;
    }
  } else if (Query.memberOrKeywordSearchString !== null) {
    searchString = Query.packageOrClassSearchString + searchFieldContents;
  } else {
    searchString = searchFieldContents;
  }

  var tokens = [];
  var splitOnPrefix;
  ['@', '#'].forEach(function(prefix) {
    if (searchString.indexOf(prefix) !== -1) {
      splitOnPrefix = searchString.split(prefix, 2);
      tokens.push(splitOnPrefix[1]);
      searchString = splitOnPrefix[0];
    } else {
      tokens.push(null);
    }
  });

  Query.packageOrClassSearchString = searchString;
  Query.memberOrKeywordSearchString = tokens[1];
  Query.menuSearchString = tokens[0];
};


/**
 * Update the view.
 */
Query._updateView = function() {
  var fieldValue = Query.getEntireSearchString();
  ['#', '@'].forEach(function(prefix) {
    if (fieldValue.indexOf(prefix) !== -1) {
      fieldValue = prefix + fieldValue.split(prefix, 2)[1];
    }
  });

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
 * Create and return a function that will take a {PackageLink}, {ClassLink},
 * {MemberLink} or {KeywordLink} as an argument and return whether that link
 * matches the given search string.
 * @param {string} searchString The search string.
 * @return {function(PackageLink|ClassLink|MemberLink|KeywordLink): boolean}
 *     The condition function.
 */
RegexLibrary.createCondition = function(searchString) {
  if (searchString.length === 0 || searchString === '*') {
    return function(link) {
      return true;
    };
  }

  var pattern = RegexLibrary._getRegex(searchString);

  return function(link) {
    return link.matches(pattern);
  };
};

UnitTestSuite.testFunctionFor('RegexLibrary.createCondition', function() {
  var javaAwtGeomPoint2DClass = new ClassLink(LinkType.CLASS,
      'java.awt.geom', 'Point2D');
  var javaAwtGeomPoint2DDoubleClass = new ClassLink(LinkType.CLASS,
      'java.awt.geom', 'Point2D.Double');
  var javaIoPackage = new PackageLink('java.io');
  var javaLangPackage = new PackageLink('java.lang');
  var javaIoCloseableClass = new ClassLink(LinkType.CLASS,
      'java.io', 'Closeable');
  var javaLangObjectClass = new ClassLink(LinkType.CLASS,
      'java.lang', 'Object');
  var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS,
      'javax.swing', 'BorderFactory');
  var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS,
      'javax.swing.border', 'AbstractBorder');
  var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS,
      'org.omg.CORBA', 'Object');
  var hudsonPackage = new PackageLink('hudson');
  var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS,
      'hudson.model', 'Hudson');
  var testOuterAppleBananaClass = new ClassLink(LinkType.CLASS,
      'test', 'Outer.Apple.Banana');

  var allLinks = [javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
    javaIoPackage, javaLangPackage, javaIoCloseableClass,
    javaLangObjectClass, javaxSwingBorderFactoryClass,
    javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass,
    hudsonPackage, hudsonModelHudsonClass, testOuterAppleBananaClass];

  var assertThatSearchResultFor = function(searchString, searchResult) {
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
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
          javaIoPackage, javaLangPackage, javaIoCloseableClass,
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('J',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
          javaIoPackage, javaLangPackage, javaIoCloseableClass,
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('Object',
      is([javaLangObjectClass, orgOmgCorbaObjectClass]));
  assertThatSearchResultFor('O',
      is([javaLangObjectClass, orgOmgCorbaObjectClass,
        testOuterAppleBananaClass]));
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
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass,
          javaLangObjectClass]));
  assertThatSearchResultFor('java.**.***o**e*',
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass,
          javaLangObjectClass]));
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
 * Create and return a function that will take a {PackageLink}, {ClassLink},
 * {MemberLink} or {KeywordLink} as an argument and return whether that link
 * is a case-sensitive exact match for the given search string.
 * @param {string} searchString The search string.
 * @return {function(PackageLink|ClassLink|MemberLink|KeywordLink): boolean}
 *     The condition function.
 */
RegexLibrary.createCaseInsensitiveExactMatchCondition = function(searchString) {
  return RegexLibrary._createExactMatchCondition(searchString, false);
};


/**
 * Create and return a function that will take a {PackageLink}, {ClassLink},
 * {MemberLink} or {KeywordLink} as an argument and return whether that link
 * is a case-sensitive exact match for the given search string.
 * @param {string} searchString The search string.
 * @return {function(PackageLink|ClassLink|MemberLink|KeywordLink): boolean}
 *     The condition function.
 */
RegexLibrary.createCaseSensitiveExactMatchCondition = function(searchString) {
  return RegexLibrary._createExactMatchCondition(searchString, true);
};


/**
 * @param {string} searchString The search string.
 * @param {boolean} caseSensitive True for a case-sensitive match, false for
 *                  case-insensitive.
 * @return {function(PackageLink|ClassLink|MemberLink|KeywordLink): boolean}
 *     The condition function.
 */
RegexLibrary._createExactMatchCondition = function(
    searchString, caseSensitive) {
  if (searchString.length === 0 || searchString.indexOf('*') !== -1) {
    return function(link) {
      return false;
    };
  }

  var pattern = RegexLibrary._getExactMatchRegex(searchString, caseSensitive);

  return function(link) {
    return link.matches(pattern);
  };
};


/**
 * @param {string} searchString The search string.
 * @return {RegExp} The regular expression for the search string.
 */
RegexLibrary._getRegex = function(searchString) {
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
      var trailingCharactersPattern = '[a-z\\d]*' + trailingCharacters +
          '[a-z\\d]*';

      if (remainingSearchString === searchString) {
        // The Camel Case expression is at the start of the search string.
        // Perform a case-insensitive match of the leading character, then
        // match the trailing characters along with other lowercase characters
        // or digit characters.
        pattern += '(' + leadingCharacter + '|' +
            leadingCharacter.toLowerCase() + ')' + trailingCharactersPattern;
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
            '(' + (endsWith(previousToken, '.') ? '' : '\\.') +
                leadingCharacter.toLowerCase() + trailingCharactersPattern +
                ')' +
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
        // Replace '*' with '.*' to allow the asterisk to be used as a
        // wildcard.

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

UnitTestSuite.testFunctionFor('RegexLibrary._getRegex', function() {
  assertThat('removal of excess asterisk characters',
      RegexLibrary._getRegex('java.**.***o**e*').pattern, is(
      RegexLibrary._getRegex('java.*.*o*e').pattern));
});


/**
 * @param {string} searchString The search string.
 * @param {boolean} caseSensitive True for a case-sensitive match, false for
 *                  case-insensitive.
 * @return {RegExp} The exact match regular expression for the search string.
 */
RegexLibrary._getExactMatchRegex = function(searchString, caseSensitive) {
  var pattern = '^';

  for (i = 0; i < searchString.length; i++) {
    var character = searchString.charAt(i);
    if (RegexLibrary._isSpecialRegularExpressionCharacter(character)) {
      pattern += '\\' + character;
    } else {
      pattern += character;
    }
  }

  pattern += '$';
  return caseSensitive ? new RegExp(pattern) : new RegExp(pattern, 'i');
};


/**
 * @param {string} character The character to inspect.
 * @return {boolean} Whether the character has a special meaning within regular
 *                   expressions.
 */
RegexLibrary._isSpecialRegularExpressionCharacter = function(character) {
  var special =
      ['\\', '^', '$', '+', '?', '.', '(', ':', '!', '|', '{', ',', '[', '*'];
  return special.some(function(specialCharacter) {
    return character === specialCharacter;
  });
};


/*
 * ----------------------------------------------------------------------------
 * Callback
 * ----------------------------------------------------------------------------
 */



/**
 * A callback function in the context of a specified object.
 * @param {function(*): *} callbackFunction The callback function.
 * @param {*} thisObject The "this" object used when calling the function.
 * @constructor
 */
Callback = function(callbackFunction, thisObject) {
  this.callbackFunction = callbackFunction;
  this.thisObject = thisObject;
};


/**
 * Invoke this callback function with the given arguments.
 * @param {Array.<*>=} opt_argsArray An array of arguments to pass to the
 *     callback function. If not provided, no arguments will be passed to the
 *     callback function.
 * @return {*} The function result.
 */
Callback.prototype.invoke = function(opt_argsArray) {
  return this.callbackFunction.apply(this.thisObject, opt_argsArray);
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
  previousEntireSearchString: null,
  timeoutId: null,
  topLink: null
};


/**
 * Perform a search.
 */
Search.perform = function() {
  var entireSearchString = Query.getEntireSearchString();
  Search._performSearch(entireSearchString);
  Search.previousEntireSearchString = entireSearchString;
};


/**
 * Perform a search after a short delay only if the search string has changed.
 */
Search.performIfSearchStringHasChanged = function() {
  var entireSearchString = Query.getEntireSearchString();
  if (entireSearchString !== Search.previousEntireSearchString) {
    if (Search.timeoutId !== null) {
      clearTimeout(Search.timeoutId);
    }
    Search.timeoutId = setTimeout(function() {
      Search.perform.apply(Search);
    }, 100);
  }
  Search.previousEntireSearchString = entireSearchString;
};


/**
 * @return {string} The URL of the link currently displayed at the top of the
 *     list, or null if no links are currently displayed.
 */
Search.getTopLinkUrl = function() {
  if (Search.topLink) {
    return Search.topLink.getUrl();
  }
  return null;
};


/**
 * @param {string} entireSearchString The search string.
 */
Search._performSearch = function(entireSearchString) {
  Option.CLASS_MENU.getValue(function(classMenu) {
    Option.PACKAGE_MENU.getValue(function(packageMenu) {
      var searchContext = {};
      searchContext.classMenu = classMenu;
      searchContext.packageMenu = packageMenu;

      Search._PackagesAndClasses._perform(
          searchContext, Query.getPackageOrClassSearchString());
      Search._ClassMembersAndKeywords._perform(
          searchContext, Query.getMemberOrKeywordSearchString());
      Search._Menu._perform(searchContext, Query.getMenuSearchString());

      if (searchContext.getContentsHtmlCallback) {
        var contentsHtml = searchContext.getContentsHtmlCallback.invoke();
        View.setContentsHtml(contentsHtml);
      }

      Search.topLink = searchContext.topMemberOrKeywordLink ||
          searchContext.topPackageOrClassLink;
      Search._autoOpen();

      if (searchContext.menuPageOpened) {
        Search._collapseMenu();
      }

    }, Search);
  }, Search);
};


/**
 * Collapse the menu after an external page has been opened.
 */
Search._collapseMenu = function() {
  Query.update('');
  Search.perform();
};


/**
 * If the option is configured, automatically open the top link.
 */
Search._autoOpen = function() {
  var url = Search.getTopLinkUrl();
  if (url) {
    Option.AUTO_OPEN.getValue(function(autoOpen) {
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
 *     deals with package and class links.
 */
Search._PackagesAndClasses = {
  previousQuery: null,
  currentLinks: null,
  bestMatch: null,
  topLink: null
};


/**
 * Perform this portion of the search.
 * @param {Object} searchContext Object which allows this search component to
 *     store a result and to inspect results provided by earlier search
 *     components.
 * @param {string} searchString The search string.
 */
Search._PackagesAndClasses._perform = function(searchContext, searchString) {
  var module = Search._PackagesAndClasses;

  if (module.previousQuery === null || module.previousQuery !== searchString) {

    if (module.previousQuery !== null &&
        searchString.indexOf(module.previousQuery) === 0) {
      // Characters have been added to the end of the previous query. Start
      // with the current search list and filter out any links that do not
      // match.
    } else {
      // Otherwise, start with the complete search list.
      module.currentLinks = ALL_PACKAGE_AND_CLASS_LINKS.concat();
    }

    var condition = RegexLibrary.createCondition(searchString);
    module.currentLinks = module.currentLinks.filter(condition);
    module.bestMatch = module._getBestMatch(searchString, module.currentLinks);
    module.topLink = module._getTopLink(module.currentLinks, module.bestMatch);
  }

  module.previousQuery = searchString;

  searchContext.topPackageOrClassLink = module.topLink;
  searchContext.getContentsHtmlCallback = new Callback(
      module._constructHtml, module);
};


/**
 * @param {Array.<PackageLink|ClassLink>} links The package and class links
 *     matched by the current search.
 * @param {PackageLink|ClassLink} bestMatch The best match link.
 * @return {PackageLink|ClassLink} The top link.
 */
Search._PackagesAndClasses._getTopLink = function(links, bestMatch) {
  if (bestMatch) {
    return bestMatch;
  }
  if (links.length > 0) {
    return links[0];
  }
  return null;
};

UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getTopLink',
    function() {
      var linkOne = new ClassLink(LinkType.CLASS, 'java.awt', 'Component');
      var linkTwo = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
      var getTopLink = Search._PackagesAndClasses._getTopLink;

      assertThat('no links, best match undefined', getTopLink([]), is(null));
      assertThat('one link, best match undefined',
          getTopLink([linkOne]), is(linkOne));
      assertThat('two links, best match undefined',
          getTopLink([linkOne, linkTwo]), is(linkOne));
      assertThat('no links, best match defined',
          getTopLink([], linkOne), is(linkOne));
      assertThat('one link, best match defined',
          getTopLink([linkOne], linkTwo), is(linkTwo));
    });


/**
 * Get the best match (if any) from the given array of links.
 * @param {string} searchString The search string.
 * @param {Array.<PackageLink|ClassLink>} links The package and class links
 *     matched by the current search.
 * @return {PackageLink|ClassLink=} The best match.
 */
Search._PackagesAndClasses._getBestMatch = function(searchString, links) {
  var caseInsensitiveExactMatchCondition =
      RegexLibrary.createCaseInsensitiveExactMatchCondition(searchString);
  var exactMatchLinks = links.filter(caseInsensitiveExactMatchCondition);
  // If all of the links displayed in the search list are exact matches, do
  // not display a best match.
  if (exactMatchLinks.length === links.length) {
    return null;
  }
  // Attempt to reduce the matches further by performing a case-sensitive match.
  var caseSensitiveExactMatchCondition =
      RegexLibrary.createCaseSensitiveExactMatchCondition(searchString);
  var caseSensitiveExactMatchLinks =
      exactMatchLinks.filter(caseSensitiveExactMatchCondition);
  if (caseSensitiveExactMatchLinks.length > 0) {
    exactMatchLinks = caseSensitiveExactMatchLinks;
  }
  // Keep only the links with the lowest package depth.
  var bestMatchLinks = [];
  var bestMatchPackageDepth;
  var name;
  var packageDepth;
  exactMatchLinks.forEach(function(link) {
    name = (link.getType() === LinkType.PACKAGE ?
        link.getPackageName() : link.getCanonicalName());
    packageDepth = name.split('.').length;
    if (!bestMatchPackageDepth || packageDepth < bestMatchPackageDepth) {
      bestMatchLinks = [link];
      bestMatchPackageDepth = packageDepth;
    } else if (packageDepth === bestMatchPackageDepth) {
      bestMatchLinks.push(link);
    }
  });
  // Finally, select the first link from the remaining matches to be the best
  // match.
  return bestMatchLinks.length > 0 ? bestMatchLinks[0] : null;
};

UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getBestMatch',
    function() {
      var hudsonPackage = new PackageLink('hudson');
      var javaIoPackage = new PackageLink('java.io');
      var javaLangPackage = new PackageLink('java.lang');
      var javaUtilListClass = new ClassLink(LinkType.INTERFACE,
          'java.util', 'List');
      var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS,
          'hudson.model', 'Hudson');
      var javaAwtListClass = new ClassLink(LinkType.CLASS,
          'java.awt', 'List');
      var javaIoCloseableClass = new ClassLink(LinkType.CLASS,
          'java.io', 'Closeable');
      var javaLangObjectClass = new ClassLink(LinkType.CLASS,
          'java.lang', 'Object');
      var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS,
          'javax.swing', 'BorderFactory');
      var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS,
          'javax.swing.border', 'AbstractBorder');
      var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS,
          'org.omg.CORBA', 'Object');

      var allLinks = [hudsonPackage, javaIoPackage, javaLangPackage,
        javaUtilListClass, hudsonModelHudsonClass, javaAwtListClass,
        javaIoCloseableClass, javaLangObjectClass, javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass];

      var assertThatBestMatchFor = function(searchString, searchResult) {
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
      assertThatBestMatchFor('org.omg.CORBA.Object', is(
          orgOmgCorbaObjectClass));
      assertThatBestMatchFor('java.lang', is(javaLangPackage));
      assertThatBestMatchFor('java.lang.', is(null));
      assertThatBestMatchFor('java.*.o*e', is(null));
      assertThatBestMatchFor('java.*.*o*e', is(null));
      assertThatBestMatchFor('javax.swing.border.A', is(null));
      assertThatBestMatchFor('hudson', is(hudsonPackage));
      assertThatBestMatchFor('Hudson', is(hudsonModelHudsonClass));
      assertThatBestMatchFor('list', is(javaUtilListClass));
    });


/**
 * @return {string} The HTML to display the search results.
 */
Search._PackagesAndClasses._constructHtml = function() {
  var module = Search._PackagesAndClasses;
  if (module.currentLinks.length === 0) {
    return 'No search results.';
  }
  var html = '';
  if (module.bestMatch && module.currentLinks.length > 1) {
    html += '<br/><b><i>Best Match</i></b><br/>';
    html += module.bestMatch.getType().getSingularName().toLowerCase();
    html += '<br/>';
    html += module.bestMatch.getHtml();
    html += '<br/>';
  }
  var type;
  var newType;
  module.currentLinks.forEach(function(link) {
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
 * Search._ClassMembersAndKeywords
 * ----------------------------------------------------------------------------
 */


/**
 * @class Search._ClassMembersAndKeywords Component of the search functionality
 *     that deals with class members and keyword links.
 */
Search._ClassMembersAndKeywords = {
  httpRequest: new HttpRequest(),

  keywords: {
    'navbar_top': 1,
    'navbar_top_firstrow': 1,
    'skip-navbar_top': 1,
    'field_summary': 1,
    'nested_class_summary': 1,
    'constructor_summary': 1,
    'constructor_detail': 1,
    'method_summary': 1,
    'method_detail': 1,
    'field_detail': 1,
    'navbar_bottom': 1,
    'navbar_bottom_firstrow': 1,
    'skip-navbar_bottom': 1
  },

  keywordPrefixes: [
    'methods_inherited_from_',
    'fields_inherited_from_',
    'nested_classes_inherited_from_'
  ]
};


/**
 * Perform this portion of the search.
 * @param {Object} searchContext Object which allows this search component to
 *     store a result and to inspect results provided by earlier search
 *     components.
 * @param {string} searchString The search string.
 */
Search._ClassMembersAndKeywords._perform = function(
    searchContext, searchString) {
  var module = Search._ClassMembersAndKeywords;
  var topPackageOrClassLink = searchContext.topPackageOrClassLink;
  if (searchString === null || !topPackageOrClassLink) {
    module.httpRequest.abort();
    return;
  }

  var progressCallback = function() {
    Search.perform.apply(Search);
  };

  module.httpRequest.load(topPackageOrClassLink.getUrl(), progressCallback);
  if (module.httpRequest.isComplete()) {
    var packageOrClassPageHtml = module.httpRequest.getResource();
    var memberAndKeywordLinks = module._getMemberAndKeywordLinks(
        topPackageOrClassLink.getUrl(), packageOrClassPageHtml);
    var condition = RegexLibrary.createCondition(searchString);

    var matchingMemberAndKeywordLinks = memberAndKeywordLinks.filter(condition);
    searchContext.topMemberOrKeywordLink =
        matchingMemberAndKeywordLinks.length > 0 ?
        matchingMemberAndKeywordLinks[0] : null;

    searchContext.getContentsHtmlCallback = new Callback(function() {
      var html = '';
      if (matchingMemberAndKeywordLinks.length === 0) {
        html += 'No search results.';
      } else {
        matchingMemberAndKeywordLinks.forEach(function(memberOrKeywordLink) {
          html += memberOrKeywordLink.getHtml();
        });
      }
      return topPackageOrClassLink.getHtml() + '<p>' + html + '</p>';
    }, module);
  } else {
    searchContext.getContentsHtmlCallback = new Callback(function() {
      return topPackageOrClassLink.getHtml() + '<p>' +
          module.httpRequest.getStatusMessage() + '</p>';
    }, module);
    searchContext.memberAndKeywordLinksLoading = true;
  }
};


/**
 * Retrieve the member and keyword links from the given package or class page.
 * @param {string} baseUrl The URL of the page.
 * @param {string} packageOrClassPageHtml The contents of the page.
 * @return {Array.<MemberLink|KeywordLink>} The links.
 */
Search._ClassMembersAndKeywords._getMemberAndKeywordLinks = function(
    baseUrl, packageOrClassPageHtml) {
  var names = Search._ClassMembersAndKeywords._getAnchorNames(
      packageOrClassPageHtml);
  return Search._ClassMembersAndKeywords._createMemberAndKeywordLinks(
      baseUrl, names);
};


/**
 * Retrieve the anchor names from the given package or class page.
 * @param {string} packageOrClassPageHtml The contents of the page.
 * @return {Array.<string>} The anchor names.
 */
Search._ClassMembersAndKeywords._getAnchorNames = function(
    packageOrClassPageHtml) {
  var anchorRegex = /<a name=\"([^\"]+)\"/gi;
  var matches;
  var names = [];
  while ((matches = anchorRegex.exec(packageOrClassPageHtml)) !== null) {
    names.push(matches[1]);
  }
  return names;
};


/**
 * Create member and keyword links from the given anchor names.
 * @param {string} baseUrl The URL of the package or class page.
 * @param {names} names The anchor names.
 * @return {Array.<MemberLink|KeywordLink>} The links.
 */
Search._ClassMembersAndKeywords._createMemberAndKeywordLinks = function(
    baseUrl, names) {
  var links = [];
  var keywordLinks = [];
  names.forEach(function(name) {
    if (Search._ClassMembersAndKeywords._isKeywordName(name)) {
      keywordLinks.push(new KeywordLink(baseUrl, name));
    } else {
      links.push(new MemberLink(baseUrl, name));
    }
  }, Search._ClassMembersAndKeywords);
  keywordLinks.forEach(function(keywordLink) {
    links.push(keywordLink);
  });
  return links;
};


/**
 * @param {string} name The anchor name.
 * @return {boolean} Whether the anchor is a keyword.
 */
Search._ClassMembersAndKeywords._isKeywordName = function(name) {
  if (Search._ClassMembersAndKeywords.keywords[name] === 1) {
    return true;
  }
  return Search._ClassMembersAndKeywords.keywordPrefixes.some(
      function(keywordPrefix) {
        if (name.indexOf(keywordPrefix) === 0) {
          return true;
        }
      });
};


/*
 * ----------------------------------------------------------------------------
 * Search._Menu
 * ----------------------------------------------------------------------------
 */


/**
 * @class Search._Menu Component of the search functionality that deals with
 *     the package menu and class menu.
 */
Search._Menu = {
  menuReplacement: null
};


/**
 * Perform this portion of the search.
 * @param {Object} searchContext Object which allows this search component to
 *     store a result and to inspect results provided by earlier search
 *     components.
 * @param {string} searchString The search string.
 */
Search._Menu._perform = function(searchContext, searchString) {
  var module = Search._Menu;
  var topPackageOrClassLink = searchContext.topPackageOrClassLink;
  var topMemberOrKeywordLink = searchContext.topMemberOrKeywordLink;

  var performMenuSearch = searchString !== null && topPackageOrClassLink &&
      !searchContext.memberAndKeywordLinksLoading &&
      topMemberOrKeywordLink !== null;
  if (!performMenuSearch) {
    return;
  }

  var menuReplacement = module._getMenuReplacement();
  var menu = module._constructMenu(searchContext, menuReplacement,
      topPackageOrClassLink, topMemberOrKeywordLink);

  searchContext.getContentsHtmlCallback = new Callback(function() {
    var html = topPackageOrClassLink.getHtml();
    if (topMemberOrKeywordLink) {
      html += '<br/>' + topMemberOrKeywordLink.getHtml();
    }
    html += '<p>' + module._constructMenuHtml(menu) + '</p>';
    return html;
  }, module);

  if (!searchString) {
    return;
  }

  for (var i = 0; i < menu.length; i++) {
    var menuElement = menu[i];
    if (menuElement.mnemonic === '@' + searchString) {
      Frames.openLinkInNewTab(menuElement.url);
    }
  }

  searchContext.menuPageOpened = true;
};


/**
 * Construct the menu.
 * @param {Object} searchContext The search context.
 * @param {{Object.<function(ClassLink|PackageLink,MemberLink)>}}
 *     memberReplacement An object containing, for each placeholder value, a
 *     function to resolve that value.
 * @param {ClassLink|PackageLink} classOrPackageLink The current class link or
 *     package link.
 * @param {MemberLink|KeywordLink} memberOrKeywordLink The current member link
 *     or keyword link.
 * @return {Array.<{mnemonic: string, label: string, url: string}>} The menu
 *     items.
 */
Search._Menu._constructMenu = function(searchContext, menuReplacement,
    classOrPackageLink, memberOrKeywordLink) {
  var classMemberLink;
  if (memberOrKeywordLink &&
      memberOrKeywordLink.getType() === LinkType.CLASS_MEMBER) {
    classMemberLink = memberOrKeywordLink;
  }

  var menuDefinition;
  if (classOrPackageLink &&
      classOrPackageLink.getType() === LinkType.PACKAGE) {
    menuDefinition = searchContext.packageMenu;
  } else {
    menuDefinition = searchContext.classMenu;
  }

  var menu = [];
  menuDefinition.split('\n').forEach(function(menuAnchorDefinition) {
    var splitOnArrow = splitOnFirst(menuAnchorDefinition, '->');
    if (splitOnArrow.length === 2) {
      var mnemonicAndLabel = splitOnFirst(splitOnArrow[0], ':');
      if (mnemonicAndLabel.length === 2) {
        var mnemonic = mnemonicAndLabel[0];
        var label = mnemonicAndLabel[1];
        var url = splitOnArrow[1];

        var matches;
        while ((matches = /##(\w+)##/.exec(url)) !== null) {
          var f = menuReplacement[matches[1]];
          var rx2 = new RegExp(matches[0], 'g');
          if (f) {
            url = url.replace(rx2, f(classOrPackageLink, classMemberLink));
          } else {
            url = url.replace(rx2, '');
          }
        }

        menu.push({mnemonic: mnemonic, label: label, url: url});
      }
    }
  });

  return menu;
};


/**
 * Placeholder values that can be entered into the class_menu or package_menu
 * options and will, when the menu is opened, be replaced with data relevant
 * to the current package or class.
 * @return {Object.<function(ClassLink|PackageLink,MemberLink)>} An object
 *     containing, for each placeholder value, a function to resolve that
 *     value.
 */
Search._Menu._getMenuReplacement = function() {
  if (!Search._Menu.menuReplacement) {
    var memberNameFunction = function(classOrPackageLink, classMemberLink) {
      return classMemberLink ? classMemberLink.getName() : '';
    };
    Search._Menu.menuReplacement = {
      CLASS_NAME: function(classLink) {
        return classLink ? classLink.getClassName() : '';
      },
      PACKAGE_NAME: function(classOrPackageLink) {
        return classOrPackageLink ? classOrPackageLink.getPackageName() : '';
      },
      PACKAGE_PATH: function(classOrPackageLink) {
        return classOrPackageLink ?
            classOrPackageLink.getPackageName().replace(/\./g, '/') : '';
      },
      MEMBER_NAME: memberNameFunction,
      METHOD_NAME: memberNameFunction, // Synonym for MEMBER_NAME.
      FIELD_NAME: memberNameFunction,  // Synonym for MEMBER_NAME.
      ANCHOR_NAME: memberNameFunction  // Deprecated synonym for MEMBER_NAME.
    };
  }
  return Search._Menu.menuReplacement;
};


/**
 * @param {{Array.<{mnemonic: string, label: string, url: string}>}} The menu
 *     items.
 * @return {string} An HTML representation of the menu items.
 */
Search._Menu._constructMenuHtml = function(menu) {
  var menuHtml = '';
  menu.forEach(function(menuElement) {
    menuHtml += '<A HREF="' + menuElement.url + '">' + menuElement.mnemonic +
        ':' + menuElement.label + '</A><BR/>';
  });
  return menuHtml;
};


/*
 * ----------------------------------------------------------------------------
 * Main script
 * ----------------------------------------------------------------------------
 */


/**
 * Initialise this script.
 * @param {function(UnitTestResult)} unitTestResultCallback Function that is
 *     called with the unit test results once the script has been initialised.
 */
function init(unitTestResultCallback) {

  Option.HIDE_PACKAGE_FRAME.getValue(function(hidePackageFrame) {

    // Retrieve the inner HTML of the class frame.
    var classesInnerHtml = getClassesInnerHtml();

    // Initialise stored package and class links.
    var classLinks = getClassLinks(classesInnerHtml);
    var packageAndClassLinks;
    if (hidePackageFrame) {
      var packageLinks = getPackageLinks(classLinks);
      packageAndClassLinks = packageLinks.concat(classLinks);
    } else {
      packageAndClassLinks = classLinks;
    }
    if (packageAndClassLinks.length === 0) {
      // Another instance of this script is already running and it has not yet
      // added the package and class links to the page.
      return;
    }
    ALL_PACKAGE_AND_CLASS_LINKS = packageAndClassLinks;

    // Initialise class frame.
    View.initialise(EventHandlers);

    // Perform an initial search. This will populate the class frame with the
    // entire list of packages and classes.
    Search.perform();

    // Run the unit test suite.
    var unitTestResult = UnitTestSuite.run();

    // Hide the package list frame.
    if (hidePackageFrame) {
      Frames.hideAllPackagesFrame();
    }

    // If the autofocus attribute is not supported, manually give focus to the
    // search field.
    if (!('autofocus' in document.createElement('input'))) {
      View.focusOnSearchField();
    }

    // Provide the unit test result to the callback function.
    unitTestResultCallback(unitTestResult);

  });
}


/**
 * Parse packages from the given array of {ClassLink} objects.
 * @param {Array.<ClassLink>} classLinks The class links.
 * @return {Array.<PackageLink>} The package links.
 */
function getPackageLinks(classLinks) {
  var packageLinks = [];
  var packageLinksAdded = {};
  var packageName;

  classLinks.forEach(function(classLink) {
    packageName = classLink.getPackageName();
    if (!packageLinksAdded[packageName]) {
      packageLinks.push(new PackageLink(packageName));
      packageLinksAdded[packageName] = true;
    }
  });

  packageLinks.sort(function(packageLinkOne, packageLinkTwo) {
    var packageNameOneComponents = packageLinkOne.getPackageName().split(/\./);
    var packageNameTwoComponents = packageLinkTwo.getPackageName().split(/\./);
    var smallerLength = Math.min(
        packageNameOneComponents.length, packageNameTwoComponents.length);
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

UnitTestSuite.testFunctionFor('getPackageLinks', function() {

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

  assertThat('', getPackageLinks(classLinks), is(expectedPackageLinks));
});


/**
 * @return {string} The inner HTML of the body element of the classes list
 *    frame, or undefined if the element does not exist.
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
 * <p>
 * Assumptions:
 * <ul>
 * <li>
 * The use of the title attribute is consistent: either all of the anchor
 * elements on the page have it, or all of them do not have it.
 * </li>
 * <li>
 * Double-quotes are used to declare the href or title attributes.
 * </li>
 * <li>
 * The italic element is the only element that can be a child of the anchor
 * element.
 * </li>
 * </ul>
 * @param {string} classesInnerHtml The inner HTML of the body element of the
 *     classes list frame.
 * @return {Array.<ClassLink>} The class links.
 */
function getClassLinks(classesInnerHtml) {
  if (!classesInnerHtml) {
    return [];
  }

  var matches;
  var classLinksMap = {};
  var classLinkTypes = [
    LinkType.PACKAGE, LinkType.INTERFACE, LinkType.CLASS, LinkType.ENUM,
    LinkType.EXCEPTION, LinkType.ERROR, LinkType.ANNOTATION
  ];
  classLinkTypes.forEach(function(type) {
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

    var classLink = new ClassLink(type, packageName, className);
    classLinksMap[type].push(classLink);
    anchorWithTitleFound = true;
  }

  if (!anchorWithTitleFound) {
    var classesWithoutTitleRegex =
        /<a\s+href\s*=\s*\"([^\"]+)(?:\/|\\)[^\"]+\"[^>]*>(\s*<i\s*>)?\s*([^<]+)(?:<\/i\s*>\s*)?<\/a\s*>/gi;
    while ((matches = classesWithoutTitleRegex.exec(classesInnerHtml)) !==
        null) {
      var packageName = matches[1].replace(/\/|\\/g, '.');
      var openingItalicTag = matches[2];
      var className = trimFromEnd(matches[3]);
      var type = openingItalicTag ? LinkType.INTERFACE : LinkType.CLASS;
      type = checkForExceptionOrErrorType(type, className);

      var classLink = new ClassLink(type, packageName, className);
      classLinksMap[type].push(classLink);
    }
  }

  var classLinks = [];
  classLinkTypes.forEach(function(type) {
    classLinks = classLinks.concat(classLinksMap[type]);
  });
  return classLinks;
}

UnitTestSuite.testFunctionFor('getClassLinks', function() {

  function assert(args, html, description) {
    var link = new ClassLink(args.type, args.package, args.class);
    assertThat(description, getClassLinks(html), is([link]));
  }

  function runClassesHtmlTestCase(args, includeTitle) {
    if (!args.typeInTitle) {
      args.typeInTitle = args.type;
    }

    var descriptionPrefix = args.type + ' ' +
        (includeTitle ? 'with title' : 'without title') + ',' +
        (args.italic ? 'with italic tag' : 'without italic tag') + ': ';

    var lowerCaseHtml =
        '<a href="' + args.href + '"' +
        (includeTitle ?
            ' title="' + args.typeInTitle + ' in ' + args.package : '') +
        '" target="classFrame">' +
        (args.italic ? '<i>' + args.class + '</i>' : args.class) +
        '</a>';
    assert(args, lowerCaseHtml, descriptionPrefix + 'lowercase html tags');

    var upperCaseHtml =
        '<A HREF="' + args.href + '"' +
        (includeTitle ?
            ' TITLE="' + args.typeInTitle + ' IN ' + args.package : '') +
        '" TARGET="classFrame">' +
        (args.italic ? '<I>' + args.class + '</I>' : args.class) +
        '</A>';
    assert(args, upperCaseHtml, descriptionPrefix + 'uppercase html tags');

    var lowerCaseWithWhitespaceHtml =
        '<a   href  =   "' + args.href + '"' +
        (includeTitle ? '   title  =  "  ' + args.typeInTitle + '   in   ' +
            args.package : '') +
        '  "   target  =  "classFrame"  >  ' +
        (args.italic ? '<i  >  ' + args.class + '  </i  >' : args.class) +
        '   </a  >';
    assert(args, lowerCaseWithWhitespaceHtml, descriptionPrefix +
        'lowercase html tags with additonal whitespace');

    var upperCaseWithWhitespaceHtml =
        '<A   HREF  =  "' + args.href + '"' +
        (includeTitle ? '   TITLE="' + args.typeInTitle +
            '   in   ' + args.package : '') +
        '   "   TARGET  =  "classFrame"  >  ' +
        (args.italic ? '<I  >  ' + args.class + '  </I  >' : args.class) +
        '   </A  >';
    assert(args, upperCaseWithWhitespaceHtml, descriptionPrefix +
        'uppercase html tags with additional whitespace');
  }

  function runTitleTestCase(args) {
    runClassesHtmlTestCase(args, true);
  }

  function runTitleAndNoTitleTestCase(args) {
    runClassesHtmlTestCase(args, true);
    runClassesHtmlTestCase(args, false);
  }

  // Assert that classes are matched correctly. Classes can be matched with or
  // without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'javax/swing/AbstractAction.html', type: LinkType.CLASS,
    package: 'javax.swing', class: 'AbstractAction', italic: false});

  // Assert that interfaces are matched correctly. Interfaces can be matched
  // with or without a title attribute. If an anchor has no title attribute,
  // the contents of the anchor must in italics to be recognised as an
  // interface.
  runTitleAndNoTitleTestCase({
    href: 'javax/swing/text/AbstractDocument.AttributeContext.html',
    type: LinkType.INTERFACE,
    package: 'javax.swing.text', class: 'AbstractDocument.AttributeContext',
    italic: true});
  runTitleTestCase({
    href: 'javax/swing/text/AbstractDocument.AttributeContext.html',
    type: LinkType.INTERFACE,
    package: 'javax.swing.text', class: 'AbstractDocument.AttributeContext',
    italic: false});

  // Assert that enumerations are matched correctly. Anchors must have a title
  // attribute to be recognised as an enumeration.
  runTitleTestCase({
    href: 'java/net/Authenticator.RequestorType.html', type: LinkType.ENUM,
    package: 'java.net', class: 'Authenticator.RequestorType',
    italic: false});

  // Assert that exceptions are matched correctly. Exceptions can be matched
  // with or without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'java/security/AccessControlException.html',
    type: LinkType.EXCEPTION, typeInTitle: 'class',
    package: 'java.security', class: 'AccessControlException',
    italic: false});

  // Assert that errors are matched correctly. Errors can be matched with or
  // without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'java/lang/AbstractMethodError.html',
    type: LinkType.ERROR, typeInTitle: 'class',
    package: 'java.lang', class: 'AbstractMethodError', italic: false});

  // Assert that annotations are matched correctly. Anchors must have a title
  // attribute to be recognised as an annotation.
  runTitleTestCase({
    href: 'javax/xml/ws/Action.html', type: LinkType.ANNOTATION,
    package: 'javax.xml.ws', class: 'Action', italic: false});
});


/**
 * Determine whether stringOne ends with stringTwo.
 * @param {string} stringOne The first string.
 * @param {string} stringTwo The second string.
 * @return {boolean} Whether stringOne ends with stringTwo.
 */
function endsWith(stringOne, stringTwo) {
  if (!stringOne) {
    return false;
  }
  var strIndex = stringOne.length - stringTwo.length;
  return strIndex >= 0 && stringOne.substring(strIndex) === stringTwo;
}

UnitTestSuite.testFunctionFor('endsWith', function() {

  var quote = UnitTestSuite.quote;

  var assertThatEndsWith = function(stringOne, stringTwo, expectedResult) {
    assertThat(quote(stringOne) + ' ends with ' + quote(stringTwo) + ':',
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
 * Trim whitespace from the start of the given string.
 * @param {string} stringToTrim The string to trim.
 * @return {string} The trimmed string.
 */
function trimFromStart(stringToTrim) {
  return stringToTrim.replace(/^\s+/, '');
}

UnitTestSuite.testFunctionFor('trimFromStart', function() {

  var assertThatTrimFromStart = function(stringToTrim, expectedResult) {
    assertThat(UnitTestSuite.quote(stringToTrim), trimFromStart(stringToTrim),
        expectedResult);
  };

  assertThatTrimFromStart('string', is('string'));
  assertThatTrimFromStart('string   ', is('string   '));
  assertThatTrimFromStart('   string', is('string'));
  assertThatTrimFromStart('   string   ', is('string   '));
});


/**
 * Trim whitespace from the end of the given string.
 * @param {string} stringToTrim The string to trim.
 * @return {string} The trimmed string.
 */
function trimFromEnd(stringToTrim) {
  return stringToTrim.replace(/\s+$/, '');
}

UnitTestSuite.testFunctionFor('trimFromEnd', function() {

  var assertThatTrimFromEnd = function(stringToTrim, expectedResult) {
    assertThat(UnitTestSuite.quote(stringToTrim), trimFromEnd(stringToTrim),
        expectedResult);
  };

  assertThatTrimFromEnd('string', is('string'));
  assertThatTrimFromEnd('string   ', is('string'));
  assertThatTrimFromEnd('   string', is('   string'));
  assertThatTrimFromEnd('   string   ', is('   string'));
});


/**
 * Split the given string on the first occurence of the given separator string.
 * Any whitespace surrounding the first occurence of the separator will be
 * removed.
 * @param {string} stringToSplit The string to split.
 * @param {string} separator The separator string.
 * @return {Array.<string>} An array containing two elements: the portion of
 *     the string found before the first occurence of the separator, and the
 *     portion of the string found after the first occurence of the separator.
 */
function splitOnFirst(stringToSplit, separator) {
  var firstOccurrence = stringToSplit.indexOf(separator);
  if (firstOccurrence === -1) {
    return [stringToSplit, ''];
  }
  return [
    trimFromEnd(stringToSplit.substring(0, firstOccurrence)),
    trimFromStart(stringToSplit.substring(
          firstOccurrence + separator.length, stringToSplit.length))
  ];
}

UnitTestSuite.testFunctionFor('splitOnFirst', function() {

  var quote = UnitTestSuite.quote;

  var assertThatSplitOnFirst = function(
      stringToSplit, separator, expectedResult) {
    assertThat(
        'split ' + quote(stringToSplit) + ' on first ' + quote(separator),
        splitOnFirst(stringToSplit, separator),
        expectedResult);
  };

  assertThatSplitOnFirst(' one ', ',', is([' one ', '']));
  assertThatSplitOnFirst(' one , two ', ',', is([' one', 'two ']));
  assertThatSplitOnFirst(' one , two , three ', ',', is(
      [' one', 'two , three ']));
  assertThatSplitOnFirst('one,two,three', ',', is(['one', 'two,three']));
  assertThatSplitOnFirst('one->two->three', '->', is(['one', 'two->three']));
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
 * @param {Event} evt The event.
 */
EventHandlers.searchFieldKeyup = function(evt) {
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
EventHandlers.searchFieldChanged = function() {
  var searchFieldContents = View.getSearchFieldValue();
  Query.update(searchFieldContents);
  Search.performIfSearchStringHasChanged();
};


/**
 * Called when the search field has gained focus.
 */
EventHandlers.searchFieldFocus = function() {
  document.body.scrollLeft = 0;
};


/**
 * Caled when the erase button has been clicked.
 */
EventHandlers.eraseButtonClick = function() {
  Query.update('');
  View.focusOnSearchField();
  Search.performIfSearchStringHasChanged();
};


/**
 * Called when the Options link has been clicked.
 * @param {Event} evt The event.
 */
EventHandlers.optionsLinkClicked = function(evt) {
  OptionsPage.open();
  evt.preventDefault();
};


/**
 * Called when the return key has been pressed while the search field has
 * focus.
 * @param {boolean} ctrlModifier Whether the CTRL key was held down when the
 *     return key was pressed.
 */
EventHandlers._returnKeyPressed = function(ctrlModifier) {
  var searchFieldValue = View.getSearchFieldValue();
  Query.update(searchFieldValue);
  Search.performIfSearchStringHasChanged();

  var url = Search.getTopLinkUrl();
  if (url) {
    if (ctrlModifier) {
      Frames.openLinkInNewTab(url);
    } else {
      Frames.openLinkInSummaryFrameOrNewTab(url);
    }
  }
};


/**
 * Called when the escape key has been pressed while the search field has
 * focus.
 */
EventHandlers._escapeKeyPressed = function() {
  var searchFieldValue = View.getSearchFieldValue();
  if (searchFieldValue) {
    Query.update('');
    Search.performIfSearchStringHasChanged();
  }
};