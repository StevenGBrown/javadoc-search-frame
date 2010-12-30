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
 * Asynchronously loads resources from external URLs.
 * @param {View} view the object responsible for updating the UI.
 * @constructor
 */
HttpRequest = function(view) {
  this.xmlHttpRequest = null;
  this.url = null;
  this.loadedResource = null;
  this.bytesDownloaded = 0;
  this.errorMessage = null;
  this.progressCallback = null;
};


/**
 * Loads the resource at the given URL. If the resource at the given URL is
 * already being loaded, calling this function will have no effect.
 *
 * @param {string} url the URL.
 * @param {function()} progressCallback function that is called when whenever
 *                                      progress has been made towards loading
 *                                      the resource.
 */
HttpRequest.prototype.load = function(url, progressCallback) {
  if (this.url === url) {
    // Already loading the resource at this URL.
    return;
  }
  this.abort();
  this.url = url;
  this.progressCallback = progressCallback;
  var thisObj = this;
  try {
    var xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.onprogress = function(e) {
      thisObj._onprogress(e);
    };
    xmlHttpRequest.open('GET', url);
    xmlHttpRequest.onload = function(e) {
      thisObj._onload(e);
    };
    xmlHttpRequest.onerror = function(e) {
      thisObj._onerror(e);
    };
    xmlHttpRequest.overrideMimeType('text/plain; charset=x-user-defined');
    xmlHttpRequest.send(null);
  } catch (ex) {
    thisObj._onexception(ex);
  }
  this.xmlHttpRequest = xmlHttpRequest;
};


/**
 * @return {boolean} true if the loading is complete, false otherwise.
 */
HttpRequest.prototype.isComplete = function() {
  return this.loadedResource !== null;
};


/**
 * @return {string} a status message on the progress made towards loading the
 *                  resource.
 */
HttpRequest.prototype.getStatusMessage = function() {
  if (this.bytesDownloaded === -1) {
    return this.errorMessage;
  }
  if (this.bytesDownloaded > 1048576) {
    return 'loading... (' + Math.floor(this.bytesDownloaded / 1048576) + ' MB)';
  }
  if (this.bytesDownloaded > 1024) {
    return 'loading... (' + Math.floor(this.bytesDownloaded / 1024) + ' kB)';
  }
  if (this.bytesDownloaded > 0) {
    return 'loading... (' + this.bytesDownloaded + ' bytes)';
  }
  return 'loading...';
};


/**
 * @return {string} the loaded resource, or null if the loading is not
 *                  complete.
 */
HttpRequest.prototype.getResource = function() {
  return this.loadedResource;
};


/**
 * Abort the current anchor load operation.
 */
HttpRequest.prototype.abort = function() {
  if (this.xmlHttpRequest) {
    this.xmlHttpRequest.abort();
  }
  this.xmlHttpRequest = null;
  this.url = null;
  this.loadedResource = null;
  this.bytesDownloaded = 0;
  this.errorMessage = null;
  this.progressCallback = null;
};


/**
 * @param {Event} e the progress event.
 */
HttpRequest.prototype._onprogress = function(e) {
  this.bytesDownloaded = e.position;
  this.errorMessage = null;
  this.progressCallback();
};


/**
 * @param {Event} e the load event.
 */
HttpRequest.prototype._onload = function(e) {
  this.loadedResource = this.xmlHttpRequest.responseText;
  this.progressCallback();
};


/**
 * @param {Event} e the error event.
 */
HttpRequest.prototype._onerror = function(e) {
  this.bytesDownloaded = -1;
  this.errorMessage = 'ERROR';
  this.progressCallback();
};


/**
 * @param {*} ex the exception.
 */
HttpRequest.prototype._onexception = function(ex) {
  this.bytesDownloaded = -1;
  this.errorMessage = ex;
  this.progressCallback();
};
