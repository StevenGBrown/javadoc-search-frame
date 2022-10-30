/*
 * ----------------------------------------------------------------------------
 * Storage
 * ----------------------------------------------------------------------------
 */


/**
 * @class Provides storage functionality.
 */
Storage = {};


/**
 * @return {boolean} Whether storage is supported by this browser.
 */
Storage.isSupported = function() {
  return true;
};


/**
 * Retrieve the current value of an option.
 * @param {Option} option the Option to retrieve.
 * @param {function(*)} callback Callback function that is provided with the
 *     value of this option. If the option cannot be retrieved, or has not yet
 *     been configured, then the default value will be returned.
 */
Storage.get = function(option, callback) {
  chrome.storage.sync.get(option.key, function(items) {
    var value = option.defaultValue;
    var item = items[option.key];
    if (item) {
      value = item['value'];
      value = option.upgrade(value, item['version']);
    }
    callback(value);
  });
};


/**
 * Set an option to a new value.
 * @param {Option} option The option to configure.
 * @param {*} value The new value.
 */
Storage.set = function(option, value) {
  var items = {};
  var version = chrome.runtime.getManifest().version;
  items[option.key] = {'value': value, 'version': version};
  chrome.storage.sync.set(items);
};

