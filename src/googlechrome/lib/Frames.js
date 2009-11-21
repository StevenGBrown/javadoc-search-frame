/**
 * This script is distributed under the MIT licence.
 * http://en.wikipedia.org/wiki/MIT_License
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
 * @class Provides functions to interact with other frames.
 */
Frames = {};

/**
 * Hide the packages frame. If the packages frame does not exist, calling this
 * function will have no effect.
 */
Frames.hideAllPackagesFrame = function () {
  // If running on a remote site, send a request to the background page to hide
  // the packages frame. If running on local site, do not send a request, since
  // the packages frame is hidden by 'top.js'.

  // Since the approach used for local sites loads 'top.js' and other
  // scripts that are used by 'top.js' into every frame, I would prefer to use
  // the remote site approach for all sites. This is not possible since the
  // background page does not have permission to access the local sites and the
  // permissions field in the manifest file does not accept "file://*/*" as a
  // valid entry.

  if (location.protocol !== 'file:') {
    chrome.extension.sendRequest({operation: 'hidePackageFrame'});
  }
};

/**
 * Open the given URL in the summary frame. If the summary frame is not
 * displayed, the URL will be opened in a new tab or window.
 * @param url
 */
Frames.openLinkInSummaryFrame = function (url) {
  window.open(url, 'classFrame');
};
