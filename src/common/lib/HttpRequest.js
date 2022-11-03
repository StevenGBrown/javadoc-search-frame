/*
 * ----------------------------------------------------------------------------
 * HttpRequest
 * ----------------------------------------------------------------------------
 */

/**
 * Asynchronously loads resources from external URLs.
 * @constructor
 */
HttpRequest = function () {
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
 * @param {string} url The URL.
 * @param {function()} progressCallback Function that is called when whenever
 *     progress has been made towards loading the resource.
 */
HttpRequest.prototype.load = function (url, progressCallback) {
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
    xmlHttpRequest.onprogress = function (e) {
      thisObj._onprogress(e);
    };
    xmlHttpRequest.open('GET', url);
    xmlHttpRequest.onload = function (e) {
      thisObj._onload(e);
    };
    xmlHttpRequest.onerror = function (e) {
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
 * @return {boolean} Whether the loading is complete.
 */
HttpRequest.prototype.isComplete = function () {
  return this.loadedResource !== null;
};

/**
 * @return {string} A status message on the progress made towards loading the
 *     resource.
 */
HttpRequest.prototype.getStatusMessage = function () {
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
 * @return {string} The loaded resource, or null if the loading is not
 *     complete.
 */
HttpRequest.prototype.getResource = function () {
  return this.loadedResource;
};

/**
 * Abort the current anchor load operation.
 */
HttpRequest.prototype.abort = function () {
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
 * @param {Event} e The progress event.
 */
HttpRequest.prototype._onprogress = function (e) {
  this.bytesDownloaded = e.position;
  this.errorMessage = null;
  this.progressCallback();
};

/**
 * @param {Event} e The load event.
 */
HttpRequest.prototype._onload = function (e) {
  this.loadedResource = this.xmlHttpRequest.responseText;
  this.progressCallback();
};

/**
 * @param {Event} e The error event.
 */
HttpRequest.prototype._onerror = function (e) {
  this.bytesDownloaded = -1;
  this.errorMessage = 'ERROR';
  this.progressCallback();
};

/**
 * @param {*} ex The exception.
 */
HttpRequest.prototype._onexception = function (ex) {
  this.bytesDownloaded = -1;
  this.errorMessage = ex;
  this.progressCallback();
};
