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


/*
 * ----------------------------------------------------------------------------
 * Frames
 * ----------------------------------------------------------------------------
 */


/**
 * @class Provides functions to interact with other frames.
 */
Frames = {
  siblingFramesByName: {}
};


/**
 * Hide the packages frame. If the packages frame does not exist, calling this
 * function will have no effect.
 */
Frames.hideAllPackagesFrame = function() {
  if (Frames._getFrame('packageListFrame')) {
    var framesets = parent.document.getElementsByTagName('frameset');
    if (framesets) {
      var frameset = framesets[1];
      if (frameset) {
        frameset.setAttribute('rows', '0,*');
        frameset.setAttribute('border', 0);
        frameset.setAttribute('frameborder', 0);
        frameset.setAttribute('framespacing', 0);
        scroll(0, 0);
      }
    }
  }
};


/**
 * Open the given URL in the summary frame. If the summary frame is not
 * displayed, the URL will not be opened.
 * @param {string} url The URL to open.
 */
Frames.openLinkInSummaryFrame = function(url) {
  var summaryFrame = Frames._getFrame('classFrame');
  if (summaryFrame) {
    window.open(url, 'classFrame');
  }
};


/**
 * Open the given URL in the summary frame. If the summary frame is not
 * displayed, the URL will be opened in a new tab or window.
 * @param {string} url The URL to open.
 */
Frames.openLinkInSummaryFrameOrNewTab = function(url) {
  var summaryFrame = Frames._getFrame('classFrame');
  if (summaryFrame) {
    window.open(url, 'classFrame');
  } else {
    window.open(url);
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
 * Get the frame with the given name. This frame will share a parent with the
 * current frame.
 * @param {string} name The name.
 * @return {DOMWindow} The frame, or null if it could not be found.
 */
Frames._getFrame = function(name) {
  if (Frames.siblingFramesByName[name]) {
    return Frames.siblingFramesByName[name];
  }
  var frame;
  var i;
  if (parent) {
    for (i = 0; i < parent.frames.length; i++) {
      frame = parent.frames[i];
      if (frame && frame.name === name && frame.document) {
        Frames.siblingFramesByName[name] = frame;
        return frame;
      }
    }
  }
  return null;
};
