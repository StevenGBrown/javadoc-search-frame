/**
 * JAVADOC SEARCH FRAME for Greasemokey.
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


(function () {

/*
 * ----------------------------------------------------------------------------
 * Storage
 * ----------------------------------------------------------------------------
 */

#INCLUDE Storage.js


/*
 * ----------------------------------------------------------------------------
 * Option
 * ----------------------------------------------------------------------------
 */

#INCLUDE Option.js


/*
 * ----------------------------------------------------------------------------
 * OptionsPageGenerator
 * ----------------------------------------------------------------------------
 */

#INCLUDE OptionsPageGenerator.js


/*
 * ----------------------------------------------------------------------------
 * Frames
 * ----------------------------------------------------------------------------
 */

#INCLUDE Frames.js


/*
 * ----------------------------------------------------------------------------
 * OptionsPage
 * ----------------------------------------------------------------------------
*/

#INCLUDE OptionsPage.js


/*
 * ----------------------------------------------------------------------------
 * HttpRequest
 * ----------------------------------------------------------------------------
 */

#INCLUDE HttpRequest.js


#INCLUDE common.js


/**
 * Entry point of this script; called when the script has loaded.
 */
function main() {

  if (document.location.hash === '#JavadocSearchFrameOptions') {
    OptionsPageGenerator.generate();
    return;
  }

  var isGoogleChromeVersionOne = navigator.userAgent.toLowerCase().indexOf('chrome/1') !== -1;
  if (isGoogleChromeVersionOne) {
    // Google Chrome version 1 ignores the @include metadata tag, so check that
    // this is the correct document.
    if (!endsWith(document.location.toString(), '/allclasses-frame.html') &&
        !endsWith(document.location.toString(), '/package-frame.html')) {
      return;
    }
  }

  // Build date of this script. This value is set by the build script.
  var buildDate = #INCLUDE buildDate#;

  var startupLogMessage =
      'Javadoc Search Frame for Greasemonkey\n' +
      buildDate + '\n' +
      'http://code.google.com/p/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  init(function (unitTestResults) {
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


})();
