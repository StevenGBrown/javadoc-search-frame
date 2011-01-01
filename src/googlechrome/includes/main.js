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


/**
 * Entry point of this script; called when the script has loaded.
 */
function main() {

  // Wait for the onload event. If the script runs too early, it will not see
  // the document contents (the class anchors).
  if (document.readyState !== 'complete') {
    window.addEventListener('load', main, false);
    return;
  }

  // Version of this script. This value is set by the build script.
  var version = #INCLUDE version#;

  // Build date of this script. This value is set by the build script.
  var buildDate = #INCLUDE buildDate#;

  var startupLogMessage =
      'Javadoc Search Frame (Google Chrome Extension)\n' +
      'Version ' + version + ', ' + buildDate + '\n' +
      'http://code.google.com/p/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  init(function(unitTestResults) {
    console.log(startupLogMessage + unitTestResults);
  });
}


// Call the main method.
main();
