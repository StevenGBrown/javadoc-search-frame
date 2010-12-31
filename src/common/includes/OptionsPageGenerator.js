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
  contents.push(OptionsPageGenerator._createHeader(pageDocument));
  contents.push(pageDocument.createElement('p'));
  if (!Option.canGetAndSet()) {
    contents.push(
        OptionsPageGenerator._createOptionsCannotBeConfiguredErrorMessage(
            pageDocument));
    contents.push(pageDocument.createElement('p'));
  }
  contents.push(OptionsPageGenerator._booleanOption(
      pageDocument, Option.AUTO_OPEN,
      Messages.get('autoOpenOptionTitle'),
      Messages.get('autoOpenOptionOn'),
      Messages.get('autoOpenOptionOff')));
  contents.push(pageDocument.createElement('p'));
  contents.push(OptionsPageGenerator._booleanOption(
      pageDocument, Option.HIDE_PACKAGE_FRAME,
      Messages.get('mergeFramesOptionTitle'),
      Messages.get('mergeFramesOptionOn'),
      Messages.get('mergeFramesOptionOff')));
  contents.push(pageDocument.createElement('p'));
  contents.push(OptionsPageGenerator._menuOption(
      pageDocument, Option.CLASS_MENU,
      Messages.get('classOrMethodMenuTitle'),
      Messages.get('classOrMethodMenuDescription')));
  contents.push(pageDocument.createElement('p'));
  contents.push(OptionsPageGenerator._menuOption(
      pageDocument, Option.PACKAGE_MENU,
      Messages.get('packageMenuTitle'),
      Messages.get('packageMenuDescription')));
  return contents;
};


/**
 * @param {Document} pageDocument The options page document.
 * @return {Element} A header element.
 */
OptionsPageGenerator._createHeader = function(pageDocument) {
  var headerElement = pageDocument.createElement('h2');
  headerElement.textContent = Messages.get('optionsTitle');
  return headerElement;
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
 * @param {string} title The title to display.
 * @param {string} trueText The message to display when the option is true.
 * @param {string} falseText The message to display when the option is false.
 * @return {Element} An element that allows the option to be configured.
 */
OptionsPageGenerator._booleanOption = function(
    pageDocument, option, title, trueText, falseText) {
  var trueRadioButtonElement = OptionsPageGenerator._radioButton(
      pageDocument, option, title, true);
  var falseRadioButtonElement = OptionsPageGenerator._radioButton(
      pageDocument, option, title, false);

  option.getValue(function(value) {
    var radioButtonToCheck =
        value ? trueRadioButtonElement : falseRadioButtonElement;
    radioButtonToCheck.setAttribute('checked', true);

    var clickEventListener = function() {
      option.setValue(trueRadioButtonElement.checked);
    };

    trueRadioButtonElement.addEventListener(
        'click', clickEventListener, false);
    falseRadioButtonElement.addEventListener(
        'click', clickEventListener, false);
  });

  if (option.getDefaultValue()) {
    trueText += ' ' + Messages.get('default');
  } else {
    falseText += ' ' + Messages.get('default');
  }

  return OptionsPageGenerator._createTable(pageDocument, title, '', [
    OptionsPageGenerator._tableContentElementForRadioButton(
        pageDocument, trueRadioButtonElement, trueText),
    OptionsPageGenerator._tableContentElementForRadioButton(
        pageDocument, falseRadioButtonElement, falseText)
  ]);
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
  if (!Option.canGetAndSet()) {
    radioButtonElement.setAttribute('disabled', true);
  }
  return radioButtonElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {Element} radioButtonElement A radio button element.
 * @param {string} label A label for the radio button.
 * @return {Element} An element containing the radio button.
 */
OptionsPageGenerator._tableContentElementForRadioButton = function(
    pageDocument, radioButtonElement, label) {
  var spanElement = pageDocument.createElement('span');
  spanElement.innerHTML = label;

  var labelElement = pageDocument.createElement('label');
  labelElement.appendChild(radioButtonElement);
  labelElement.appendChild(spanElement);

  return labelElement;
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {Option} option A menu option.
 * @param {string} title The title to display for this option.
 * @param {string} subTitle The sub-title to display for this option.
 * @return {Element} An element that allows the option to be configured.
 */
OptionsPageGenerator._menuOption = function(
    pageDocument, option, title, subTitle) {
  var textAreaElement = pageDocument.createElement('textarea');
  textAreaElement.setAttribute('rows', 5);
  textAreaElement.setAttribute('cols', 100);
  textAreaElement.setAttribute('wrap', 'off');
  if (!Option.canGetAndSet()) {
    textAreaElement.setAttribute('disabled', true);
  }

  var restoreDefaultButtonElement = pageDocument.createElement('input');
  restoreDefaultButtonElement.setAttribute('type', 'button');
  restoreDefaultButtonElement.setAttribute('value',
      Messages.get('restoreDefault'));
  if (!Option.canGetAndSet()) {
    restoreDefaultButtonElement.setAttribute('disabled', true);
  }

  option.getValue(function(value) {
    textAreaElement.textContent = value;

    textAreaElement.addEventListener('keyup', function() {
      option.setValue(textAreaElement.value);
    }, false);

    restoreDefaultButtonElement.addEventListener('click', function() {
      textAreaElement.value = option.getDefaultValue();
      option.setValue(option.getDefaultValue());
    }, false);
  });

  return OptionsPageGenerator._createTable(pageDocument, title, subTitle,
      [textAreaElement, restoreDefaultButtonElement]);
};


/**
 * @param {Document} pageDocument The options page document.
 * @param {string} title The options page title.
 * @param {string} subTitle The option page sub-title.
 * @param {Array.<Element>} contentElements The contents of the options page.
 * @return {Element} A table element.
 */
OptionsPageGenerator._createTable = function(
    pageDocument, title, subTitle, contentElements) {
  var tableElement = pageDocument.createElement('table');
  tableElement.style.borderStyle = 'groove';
  tableElement.style.borderColor = 'blue';
  tableElement.style.borderWidth = 'thick';

  var headerTableRow = pageDocument.createElement('tr');
  headerTableRow.style.backgroundColor = '#AFEEEE';
  tableElement.appendChild(headerTableRow);

  var headerTableDataElement = pageDocument.createElement('td');
  var headerInnerHTML = '<b>' + title + '</b>';
  if (subTitle) {
    headerInnerHTML += '<br/>' + subTitle;
  }
  headerTableDataElement.innerHTML = headerInnerHTML;
  headerTableRow.appendChild(headerTableDataElement);

  var contentsTableRow = pageDocument.createElement('tr');
  contentsTableRow.style.backgroundColor = '#F0FFF0';
  tableElement.appendChild(contentsTableRow);

  var contentsTableDataElement = pageDocument.createElement('td');
  contentsTableRow.appendChild(contentsTableDataElement);

  var contentsParagraphElement = pageDocument.createElement('p');
  contentElements.forEach(function(tableContentElement) {
    contentsParagraphElement.appendChild(tableContentElement);
    contentsParagraphElement.appendChild(pageDocument.createElement('br'));
  });
  contentsTableDataElement.appendChild(contentsParagraphElement);

  return tableElement;
};
