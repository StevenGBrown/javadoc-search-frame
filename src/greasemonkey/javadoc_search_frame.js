// ==UserScript==
// @name          Javadoc Search Frame
// @namespace     http://userscripts.org/users/46156
// @description   Javadoc incremental search for packages and classes
// @copyright     2008, Steven G. Brown (https://github.com/StevenGBrown/javadoc-search-frame)
// @copyright     2006, KOSEKI Kengo (http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html)
// @license       MIT License; http://www.opensource.org/licenses/mit-license.php
// @version       #VERSION#
// @include       */allclasses-frame.html
// @include       */allclasses-frame.html#JavadocSearchFrameOptions
// @include       */package-frame.html
// @include       */package-frame.html#JavadocSearchFrameOptions
// @grant         GM.getValue
// @grant         GM.setValue
// @grant         GM_getValue
// @grant         GM_setValue
// ==/UserScript==

/**
 * Entry point of this script; called when the script has loaded.
 */
function main() {
  if (document.location.hash === '#JavadocSearchFrameOptions') {
    OptionsPageGenerator.generate();
    return;
  }

  // Version of this script. This value is set by the build script.
  var version = '#VERSION#';

  var startupLogMessage =
    '\nJavadoc Search Frame ' +
    version +
    ' (Greasemonkey User Script)\n' +
    'https://github.com/StevenGBrown/javadoc-search-frame\n' +
    navigator.userAgent +
    '\n';

  if (window.console) {
    console.log(startupLogMessage);
  }

  Storage.get(Option.HIDE_PACKAGE_FRAME, function (hidePackageFrame) {
    if (hidePackageFrame) {
      Frames.hideAllPackagesFrame(parent.document);
    }
    init(hidePackageFrame);
  });
}

// Call the main method once the rest of the script has executed.
window.setTimeout(main, 0);

// remainder of file added by the build script
