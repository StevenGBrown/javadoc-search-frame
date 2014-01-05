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


// This script is loaded into every frame for every URL, which is obviously
// not ideal. It can be removed once certain features are implemented in the
// Google Chrome browser. See each item below for details.


// This can be removed once Chromium Issue 20773  (let content scripts see
// other frames) is implemented. The content script loaded into the
// "all classes" frame can then hide the "packages" frame itself, just like the
// Greasemonkey user script does.
// http://code.google.com/p/chromium/issues/detail?id=20773
chrome.extension.sendMessage(
    {
      operation: 'get',
      key: 'hide_package_frame'
    },
    function(hidePackageFrame) {
      if (hidePackageFrame !== 'false') {
        var framesets = document.getElementsByTagName('frameset');
        if (framesets) {
          for (var i = 0; i < framesets.length; i++) {
            var frameset = framesets[i];
            var framesetChildren = frameset.children;
            if (framesetChildren &&
                framesetChildren.length === 2 &&
                framesetChildren[0].name === 'packageListFrame' &&
                framesetChildren[1].name === 'packageFrame') {
              frameset.setAttribute('rows', '0,*');
              frameset.setAttribute('border', 0);
              frameset.setAttribute('frameborder', 0);
              frameset.setAttribute('framespacing', 0);
            }
          }
        }
      }
    }
);

