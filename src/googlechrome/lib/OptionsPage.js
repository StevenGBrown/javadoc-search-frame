/*
 * ----------------------------------------------------------------------------
 * OptionsPage
 * ----------------------------------------------------------------------------
 */

/**
 * @class Options page.
 */
OptionsPage = {};

/**
 * Open the options page.
 */
OptionsPage.open = function () {
  chrome.runtime.sendMessage({ operation: 'open-options-page' });
};
