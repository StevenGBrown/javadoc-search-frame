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
Frames.hideAllPackagesFrame = function (parentDocument) {
  var framesets = parentDocument.getElementsByTagName('frameset');
  if (framesets.length > 1) {
    // Javadoc created with Java 8 or earlier
    var frameset = framesets[1];
    var framesetChildren = frameset.children;
    if (
      framesetChildren.length &&
      framesetChildren[0].name === 'packageListFrame'
    ) {
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
Frames.openLinkInSummaryFrameOrNewTab = function (url) {
  if (window.top === window) {
    Frames.openLinkInNewTab(url);
  } else {
    window.open(url, 'classFrame');
  }
};

/**
 * Open the given URL in a new tab.
 * @param {string} url The URL to open.
 */
Frames.openLinkInNewTab = function (url) {
  window.open(url);
};
