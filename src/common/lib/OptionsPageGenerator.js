/*
 * ----------------------------------------------------------------------------
 * OptionsPageGenerator
 * ----------------------------------------------------------------------------
 */


/**
 * @class Options page generator.
 */
OptionsPageGenerator = {};


/**
 * Generate the options page by replacing the current document.
 */
OptionsPageGenerator.generate = function() {
  document.title = Messages.get('optionsTitle');

  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  var contents = OptionsPageGenerator._createContents(document);
  contents.forEach(function(pageElement) {
    document.body.appendChild(pageElement);
  });
};


/**
 * Create the contents of the options page.
 * @param {Document} pageDocument The options page document.
 * @return {Array.<Element>} The contents of the options page.
 */
OptionsPageGenerator._createContents = function(pageDocument) {
  var contents = [];
  var optionsTitleElement = OptionsPageGenerator._text(
      pageDocument, 'h1', Messages.get('optionsTitle'));
  optionsTitleElement.setAttribute('style', 'font-family: sans-serif; ' +
      'font-weight:normal; font-size:1.5em; margin-bottom:0.2em');
  contents.push(optionsTitleElement);
  contents.push(pageDocument.createElement('hr'));
  contents.push(pageDocument.createElement('p'));
  if (!Storage.isSupported()) {
    contents.push(
        OptionsPageGenerator._createOptionsCannotBeConfiguredErrorMessage(
            pageDocument));
    contents.push(pageDocument.createElement('p'));
  }
  contents.push(OptionsPageGenerator._title(
      pageDocument, Messages.get('mergeFramesOptionTitle')));
  contents.push(OptionsPageGenerator._booleanOption(
      pageDocument, Option.HIDE_PACKAGE_FRAME,
      'hidePackageFrame',
      Messages.get('mergeFramesOptionOn'),
      Messages.get('mergeFramesOptionOff')));
  contents.push(pageDocument.createElement('p'));
  contents.push(OptionsPageGenerator._title(
      pageDocument, Messages.get('menuOptionTitle')));
  contents.push(OptionsPageGenerator._menuOption(
      pageDocument, Messages.get('classOrMethodMenuOptionDescription'),
      Option.CLASS_MENU));
  contents.push(pageDocument.createElement('p'));
  contents.push(OptionsPageGenerator._menuOption(
      pageDocument, Messages.get('packageMenuOptionDescription'),
      Option.PACKAGE_MENU));
  return contents;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {string} elementType The type of element to create.
 * @param {string} text The text content of the element.
 * @return {Element} The text element.
 */
OptionsPageGenerator._text = function(pageDocument, elementType, text) {
  var labelElement = pageDocument.createElement(elementType);
  labelElement.textContent = text;
  labelElement.setAttribute('style', 'font-family: sans-serif');
  return labelElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {string} title The title text.
 * @return {Element} An element that displays the title for an option.
 */
OptionsPageGenerator._title = function(pageDocument, title) {
  var titleElement = OptionsPageGenerator._text(pageDocument, 'h2', title);
  titleElement.setAttribute('style', 'font-family: sans-serif; ' +
      'font-weight:normal; font-size:1.3em; margin-top:1em');
  return titleElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @return {Element} An error message element.
 */
OptionsPageGenerator._createOptionsCannotBeConfiguredErrorMessage = function(
    pageDocument) {
  var errorMessageElement = pageDocument.createElement('p');
  errorMessageElement.innerHTML = Messages.get('optionsReadOnly');
  errorMessageElement.style.color = 'red';
  return errorMessageElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {Option} option A boolean option.
 * @param {string} name The option name, used to name the form elements.
 * @param {string} trueText The message to display when the option is true.
 * @param {string} falseText The message to display when the option is false.
 * @return {Element} An element that allows the option to be configured.
 */
OptionsPageGenerator._booleanOption = function(
    pageDocument, option, name, trueText, falseText) {

  var trueRadioButtonElement = OptionsPageGenerator._radioButton(
      pageDocument, option, name, true);
  var trueLabelElement = OptionsPageGenerator._text(
      pageDocument, 'label', '   ' + trueText);
  trueLabelElement.insertBefore(
      trueRadioButtonElement, trueLabelElement.firstChild);

  var falseRadioButtonElement = OptionsPageGenerator._radioButton(
      pageDocument, option, name, false);
  var falseLabelElement = OptionsPageGenerator._text(
      pageDocument, 'label', '   ' + falseText);
  falseLabelElement.insertBefore(
      falseRadioButtonElement, falseLabelElement.firstChild);

  Storage.get(option, function(value) {
    var radioButtonToCheck =
        value ? trueRadioButtonElement : falseRadioButtonElement;
    radioButtonToCheck.setAttribute('checked', true);

    var clickEventListener = function() {
      Storage.set(option, trueRadioButtonElement.checked);
    };

    trueRadioButtonElement.addEventListener(
        'click', clickEventListener, false);
    falseRadioButtonElement.addEventListener(
        'click', clickEventListener, false);
  });

  var blockElement = pageDocument.createElement('div');
  blockElement.setAttribute('style', 'margin-left:20px');
  if (option.defaultValue) {
    blockElement.appendChild(trueLabelElement);
    blockElement.appendChild(pageDocument.createElement('p'));
    blockElement.appendChild(falseLabelElement);
  } else {
    blockElement.appendChild(falseLabelElement);
    blockElement.appendChild(pageDocument.createElement('p'));
    blockElement.appendChild(trueLabelElement);
  }
  return blockElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {Option} option A boolean option.
 * @param {string} name The name to display on the radio button.
 * @param {boolean} checked Whether to check the radio button.
 * @return {Element} A radio button element used to display the boolean option.
 */
OptionsPageGenerator._radioButton = function(
    pageDocument, option, name, checked) {
  var radioButtonElement = pageDocument.createElement('input');
  radioButtonElement.setAttribute('type', 'radio');
  radioButtonElement.setAttribute('name', name);
  radioButtonElement.setAttribute('value', checked);
  if (!Storage.isSupported()) {
    radioButtonElement.disabled = true;
  }
  return radioButtonElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {string} description A description of the option.
 * @param {Option} option A menu option.
 * @return {Element} An element that allows the option to be configured.
 */
OptionsPageGenerator._menuOption = function(pageDocument, description, option) {
  var restoreDefaultButtonElement = pageDocument.createElement('input');
  restoreDefaultButtonElement.setAttribute('type', 'button');
  restoreDefaultButtonElement.setAttribute('value',
      Messages.get('restoreDefault'));
  restoreDefaultButtonElement.disabled = true;

  var saveButtonElement = pageDocument.createElement('input');
  saveButtonElement.setAttribute('type', 'button');
  saveButtonElement.setAttribute('value', Messages.get('saveChanges'));
  saveButtonElement.disabled = true;

  var textAreaElement = pageDocument.createElement('textarea');
  textAreaElement.setAttribute('rows', 5);
  textAreaElement.setAttribute('cols', 100);
  textAreaElement.setAttribute('wrap', 'off');
  textAreaElement.disabled = true;

  Storage.get(option, function(value) {
    textAreaElement.value = value;

    if (Storage.isSupported()) {
      var savedValue = value;

      var updateEnabled = function() {
        var hasDefault = (textAreaElement.value === option.defaultValue);
        restoreDefaultButtonElement.disabled = hasDefault;
        var hasSaved = (textAreaElement.value === savedValue);
        saveButtonElement.disabled = hasSaved;
      };

      var save = function() {
        Storage.set(option, textAreaElement.value);
        savedValue = textAreaElement.value;
        updateEnabled();
      };

      restoreDefaultButtonElement.addEventListener('click', function() {
        textAreaElement.value = option.defaultValue;
        save();
      }, false);

      saveButtonElement.addEventListener('click', save, false);

      textAreaElement.addEventListener('input', updateEnabled, false);
      updateEnabled();

      textAreaElement.disabled = false;
    }
  });

  var blockElement = pageDocument.createElement('div');
  blockElement.setAttribute('style', 'margin-left:20px');
  blockElement.appendChild(OptionsPageGenerator._text(
      pageDocument, 'span', description));
  blockElement.appendChild(pageDocument.createElement('p'));
  blockElement.appendChild(restoreDefaultButtonElement);
  blockElement.appendChild(saveButtonElement);
  blockElement.appendChild(pageDocument.createElement('br'));
  blockElement.appendChild(textAreaElement);
  return blockElement;
};

