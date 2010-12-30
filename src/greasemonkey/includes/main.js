/**
 * The MIT License
 *
 * Copyright (c) 2010 Steven G. Brown
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


/**
 * If the given menu option does not match the new format, set it to the
 * default.
 * @param {Option} option the menu option.
 */
function updateMenuOption(option) {
  option.getValue(function(value) {
    if (value && value.indexOf('->') === -1) {
      option.setValue(option.getDefaultValue());
    }
  });
}


/**
 * Entry point of this script; called when the script has loaded.
 */
function main() {

  if (document.location.hash === '#JavadocSearchFrameOptions') {
    OptionsPageGenerator.generate();
    return;
  }

  var isGoogleChromeVersionOne =
      navigator.userAgent.toLowerCase().indexOf('chrome/1') !== -1;
  if (isGoogleChromeVersionOne) {
    // Google Chrome version 1 ignores the @include metadata tag, so check that
    // this is the correct document.
    if (!endsWith(document.location.toString(), '/allclasses-frame.html') &&
        !endsWith(document.location.toString(), '/package-frame.html')) {
      return;
    }
  }

  updateMenuOption(Option.CLASS_MENU);
  updateMenuOption(Option.PACKAGE_MENU);

  // Build date of this script. This value is set by the build script.
  var buildDate = #INCLUDE buildDate#;

  var startupLogMessage =
      'Javadoc Search Frame (Greasemonkey User Script)\n' +
      buildDate + '\n' +
      'http://code.google.com/p/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  init(function(unitTestResults) {
    var logMessage = '\n' + startupLogMessage + unitTestResults;
    try {
      GM_log(logMessage);
    } catch (ex) {
      console.log(logMessage);
    }
  });
}


// Call the main method.
main();
