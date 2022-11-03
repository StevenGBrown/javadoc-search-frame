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
Storage.isSupported = function () {
  if (typeof GM !== 'undefined') {
    return GM.getValue && GM.setValue;
  }
  return (
    typeof GM_getValue !== 'undefined' && typeof GM_setValue !== 'undefined'
  );
};

/**
 * Retrieve the current value of an option.
 * @param {Option} option the Option to retrieve.
 * @param {function(*)} callback Callback function that is provided with the
 *     value of this option. If the option cannot be retrieved, or has not yet
 *     been configured, then the default value will be returned.
 */
Storage.get = function (option, callback) {
  Storage._getValue(option.key, function (value) {
    if (value === undefined || value === null) {
      callback(option.defaultValue);
    } else {
      if (option.type === Boolean) {
        value = '' + value;
        value = option.defaultValue ? value !== 'false' : value === 'true';
      }
      Storage._getValue(option.key + '_version', function (version) {
        value = option.upgrade(value, version || '1.4.6');
        callback(value);
      });
    }
  });
};

Storage._getValue = function (key, callback) {
  if (typeof GM !== 'undefined' && GM.getValue) {
    GM.getValue(key).then(callback);
  } else if (typeof GM_getValue !== 'undefined') {
    callback(GM_getValue(key));
  } else {
    callback(undefined);
  }
};

/**
 * Set an option to a new value.
 * @param {Option} option The option to configure.
 * @param {*} value The new value.
 */
Storage.set = function (option, value) {
  Storage._setValue(option.key, value);
  var version = '#VERSION#'; // The version number is set by the build script.
  Storage._setValue(option.key + '_version', version);
};

Storage._setValue = function (key, value) {
  if (typeof GM !== 'undefined' && GM.setValue) {
    GM.setValue(key, value);
  } else {
    GM_setValue(key, value);
  }
};
