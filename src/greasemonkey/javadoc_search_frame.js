// ==UserScript==
// @name          Javadoc Search Frame
// @namespace     http://userscripts.org/users/46156
// @description   Javadoc incremental search for packages and classes
// @copyright     2012, Steven G. Brown (http://code.google.com/p/javadoc-search-frame)
// @copyright     2006, KOSEKI Kengo (http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html)
// @license       MIT License; http://www.opensource.org/licenses/mit-license.php
// @version       #VERSION#
// @include       */allclasses-frame.html
// @include       */allclasses-frame.html#JavadocSearchFrameOptions
// @include       */package-frame.html
// @include       */package-frame.html#JavadocSearchFrameOptions
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_log
// ==/UserScript==

/**
 * The MIT License
 *
 * Copyright (c) 2008 Steven G. Brown
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


/**
 * If the given menu option does not match the new format, set it to the
 * default.
 * @param {Option} option The menu option.
 */
function updateMenuOption(option) {
  Storage.get(option, function(value) {
    if (value && value.indexOf('->') === -1) {
      Storage.set(option, option.defaultValue);
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

  updateMenuOption(Option.CLASS_MENU);
  updateMenuOption(Option.PACKAGE_MENU);

  // Version of this script. This value is set by the build script.
  var version = '#VERSION#';

  var startupLogMessage =
      '\nJavadoc Search Frame ' + version + ' (Greasemonkey User Script)\n' +
      'http://code.google.com/p/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  try {
    GM_log(startupLogMessage);
  } catch (ex) {
    console.log(startupLogMessage);
  }

  Storage.get(Option.HIDE_PACKAGE_FRAME, function(hidePackageFrame) {
    if (hidePackageFrame) {
      Frames.hideAllPackagesFrame();
    }
    init(hidePackageFrame);
  });
}


// Call the main method once the rest of the script has executed.
window.setTimeout(main, 0);

var messages =
    // remainder of file added by the build script

