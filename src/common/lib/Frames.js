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


/*
 * ----------------------------------------------------------------------------
 * Frames
 * ----------------------------------------------------------------------------
 */


/**
 * @class Provides functions to interact with other frames.
 */
Frames = {};


/**
 * Hide the packages frame. If the packages frame does not exist, calling this
 * function will have no effect.
 * 
 * @param {Document} parentDocument The document containing the Javadoc frames or iframes.
 */
Frames.hideAllPackagesFrame = function(parentDocument) {
  var framesets = parentDocument.getElementsByTagName('frameset');
  if (framesets.length > 1) {
    // Javadoc created with Java 8 or earlier
    var frameset = framesets[1];
    var framesetChildren = frameset.children;
    if (framesetChildren.length &&
        framesetChildren[0].name === 'packageListFrame') {
      frameset.setAttribute('rows', '0,*');
      frameset.setAttribute('border', '0');
      frameset.setAttribute('frameborder', '0');
      frameset.setAttribute('framespacing', '0');
    }
  } else {
    // Javadoc created with Java 9
    var divs = parentDocument.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
      var div = divs[i];
      if (div.className === 'leftTop') {
        div.style.display = 'none';
      }
      if (div.className === 'leftBottom') {
        div.style.height = '100%';
      }
    }
  }
};


/**
 * Open the given URL in the summary frame. If the summary frame is not
 * displayed, the URL will be opened in a new tab or window.
 * @param {string} url The URL to open.
 */
Frames.openLinkInSummaryFrameOrNewTab = function(url) {
  if (window.top === window) {
    Frames.openLinkInNewTab(url);
  } else {
    Frames.onSummaryFrameLoad(function(iframe) {
      iframe.contentDocument.getElementById('search').blur();
      iframe.focus();
    });
    window.open(url, 'classFrame');
  }
};


/**
 * Open the given URL in a new tab.
 * @param {string} url The URL to open.
 */
Frames.openLinkInNewTab = function(url) {
  window.open(url);
};


/**
 * Call the provided function once the summary frame has been loaded. If the
 * page was generated with Java 8 or earlier, the function will not be called.
 * @param {function(*): void} onLoad Function which is called with the iframe
 * once it has loaded.
 */
Frames.onSummaryFrameLoad = function(onLoad) {
  var iframes = parent.document.getElementsByTagName('iframe');
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    if (iframe.name === 'classFrame') {
      iframe.addEventListener('load', function() {
        onLoad(iframe);
      }, false);
      return;
    }
  }
};
