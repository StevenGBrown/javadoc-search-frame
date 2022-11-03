/*
 * ----------------------------------------------------------------------------
 * Messages
 * ----------------------------------------------------------------------------
 */

/**
 * @class Provides localised strings.
 */
Messages = {};

/**
 * Retrieve a localised string.
 * @param {string} key The key used to lookup the localised string.
 * @return {string} The localised string.
 */
Messages.get = function (key) {
  var message = chrome.i18n.getMessage(key);
  if (!message) {
    throw new Error('Messages.get(' + key + ') not found');
  }
  return message;
};
