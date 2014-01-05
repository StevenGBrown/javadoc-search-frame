/**
 * The MIT License
 *
 * Copyright (c) 2012 Steven G. Brown
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
 * UnitTestSuite
 * ----------------------------------------------------------------------------
 */


/**
 * @class Unit test suite.
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
    result += '<font color="red">' + this.failures.length + ' of ' +
        this.numberOfAssertions + ' assertions FAILED</font><p>';
  } else {
    result += '<font color="green">All ' + this.numberOfAssertions +
        ' unit test assertions passed.</font><p>';
  }
  this.failures.forEach(function(unitTestFailure) {
    result += unitTestFailure + '<p>';
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
  var failureString = '<b>' + this.functionUnderTestName + '</b><br>';
  if (this.description) {
    failureString += this.description + '<br>';
  }
  failureString += 'Expected<br>"' + this.expected + '"<br>' +
                   'but was<br>"' + this.actual + '"';
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

