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
 * HttpRequest
 * ----------------------------------------------------------------------------
 */

/**
 * @class HttpRequest Asynchronously loads resources from external URLs.
 */
HttpRequest = function(view) {
  this.view = view;
  this.port = null;
  this.url = null;
  this.loadedResource = null;
  this.statusMessage = null;
};

/**
 * Loads the resource at the given URL. If the resource at the given URL is
 * already being loaded, calling this function will have no effect.
 *
 * @param url the URL.
 * @param progressCallback function that is called when whenever some progress
 *                         has been made towards loading the resource.
 */
HttpRequest.prototype.load = function(url, progressCallback) {
  if (this.url === url) {
    // Already loading the resource at this URL.
    return;
  }
  this.abort();
  this.url = url;

  var thisObj = this;

  if (url.indexOf('file://') === 0) {
    chrome.extension.sendRequest(
        {
          operation: 'requestContent',
          contentUrl: url
        },
        function(response) {
          thisObj.view.removeInnerFrame(url);
          thisObj.loadedResource = response;
          progressCallback();
        }
    );
    this.view.addInnerFrame(url);
    return;
  }

  var connectionInfo = {name: 'httpRequest', httpRequestUrl: url};
  this.port = chrome.extension.connect(connectionInfo);

  this.port.onMessage.addListener(function(msg) {
    if (msg.type === 'status') {
      thisObj.statusMessage = msg.status;
      progressCallback();
    }
    if (msg.type === 'resource') {
      thisObj.loadedResource = msg.resource;
      progressCallback();
    }
  });

  this.port.postMessage({httpRequestUrl: url});
};

/**
 * @retuns true if the loading is complete, false otherwise
 */
HttpRequest.prototype.isComplete = function() {
  return this.loadedResource !== null;
};

/**
 * @return a status message on the progress made towards loading the resource
 */
HttpRequest.prototype.getStatusMessage = function() {
  if (this.statusMessage) {
    return this.statusMessage;
  }
  return 'loading...';
};

/**
 * @return the loaded resource, or null if the loading is not complete
 */
HttpRequest.prototype.getResource = function() {
  return this.loadedResource;
};

/**
 * Abort the current anchor load operation.
 */
HttpRequest.prototype.abort = function() {
  if (this.port) {
    this.port.disconnect();
  }
  this.port = null;
  this.url = null;
  this.loadedResource = null;
  this.statusMessage = null;
};
