/**
 * The MIT License
 *
 * Copyright (c) 2009 Steven G. Brown
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

  // Version of this script. This value is set by the build script.
  var version = '#VERSION#';

  var startupLogMessage =
      'Javadoc Search Frame ' + version + ' (Google Chrome Extension)\n' +
      'https://github.com/StevenGBrown/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  console.log(startupLogMessage);

  Storage.get(Option.HIDE_PACKAGE_FRAME, function(hidePackageFrame) {
    if (hidePackageFrame && window.top !== window) {
      if (document.location.protocol === 'file:') {
        // Content scripts on local pages cannot access the parent document.
        chrome.runtime.sendMessage({operation: 'hide-allpackages-frame'});
      } else {
        // This way seems to load faster. Do it if possible.
        Frames.hideAllPackagesFrame(parent.document);
      }
    }

    init(hidePackageFrame);

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request === 'focus-on-search-field') {
            View.focusOnSearchField();
          } else if (request === 'clear-search-field') {
            View.clearSearchField();
          }
        }
    );
  });
}


// Call the main method.
main();
