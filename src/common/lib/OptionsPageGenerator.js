/**
 * This script is distributed under the MIT licence.
 * http://en.wikipedia.org/wiki/MIT_License
 * 
 * Copyright (c) 2009 Steven G. Brown
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


/**
 * @class Options page generator.
 */
OptionsPageGenerator = {};

/**
 * Generate the options page by replacing the current document.
 */
OptionsPageGenerator.generate = function () {
  document.title = 'Options: Javadoc Search Frame';

  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }

  var contents = this._createContents(document);
  contents.forEach(function (pageElement) {
    document.body.appendChild(pageElement);
  });
};

OptionsPageGenerator._createContents = function (pageDocument) {
  var contents = [];
  contents.push(this._createHeader(pageDocument));
  contents.push(pageDocument.createElement('p'));
  if (!Option.canGetAndSet()) {
    contents.push(this._createOptionsCannotBeConfiguredErrorMessage(pageDocument));
    contents.push(pageDocument.createElement('p'));
  }
  contents.push(this._booleanOption(
      pageDocument, Option.AUTO_OPEN, 'Automatic Opening of Links',
      'On. Automatically open the first package, class or method in the list after each search.',
      'Off. Wait for the <tt>Enter</tt> key to be pressed.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._booleanOption(
      pageDocument, Option.HIDE_PACKAGE_FRAME, 'Merge the Package and Class Frames',
      'Yes. All packages and classes can be searched using a single combined frame.',
      'No. The package frame will not be hidden. Only one package can be searched at a time.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._menuOption(
      pageDocument, Option.CLASS_MENU, 'Class/Method Menu',
      'Menu displayed when pressing the <tt>@</tt> key if a class or method is ' +
      'currently displayed at the top of the search list.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._menuOption(
      pageDocument, Option.PACKAGE_MENU, 'Package Menu',
      'Menu displayed when pressing the <tt>@</tt> key if a package is currently displayed ' +
      'at the top of the search list.'));
  return contents;
};

OptionsPageGenerator._createHeader = function (pageDocument) {
  var headerElement = pageDocument.createElement('h2');
  headerElement.textContent = 'Javadoc Search Frame Options';
  return headerElement;
};

OptionsPageGenerator._createOptionsCannotBeConfiguredErrorMessage = function (pageDocument) {
  var errorMessageElement = pageDocument.createElement('p');
  errorMessageElement.innerHTML = 'Options cannot be configured.';
  errorMessageElement.style.color = 'red';
  return errorMessageElement;
};

OptionsPageGenerator._booleanOption = function (pageDocument, option, title, trueText, falseText) {
  var trueRadioButtonElement = this._radioButton(pageDocument, option, title, true);
  var falseRadioButtonElement = this._radioButton(pageDocument, option, title, false);

  option.getValue(function (value) {
    var radioButtonToCheck = value ? trueRadioButtonElement : falseRadioButtonElement;
    radioButtonToCheck.setAttribute('checked', true);

    var clickEventListener = function () {
      option.setValue(trueRadioButtonElement.checked);
    };

    trueRadioButtonElement.addEventListener('click', clickEventListener, false);
    falseRadioButtonElement.addEventListener('click', clickEventListener, false);
  });

  if (option.getDefaultValue()) {
    trueText += ' (Default)';
  } else {
    falseText += ' (Default)';
  }

  return this._createTable(pageDocument, title, '', [
      this._tableContentElementForRadioButton(pageDocument, trueRadioButtonElement, trueText),
      this._tableContentElementForRadioButton(pageDocument, falseRadioButtonElement, falseText)
  ]);
};

OptionsPageGenerator._radioButton = function (pageDocument, option, name, value) {
  var radioButtonElement = pageDocument.createElement('input');
  radioButtonElement.setAttribute('type', 'radio');
  radioButtonElement.setAttribute('name', name);
  radioButtonElement.setAttribute('value', value);
  if (!Option.canGetAndSet()) {
    radioButtonElement.setAttribute('disabled', true);
  }
  return radioButtonElement;
};

OptionsPageGenerator._tableContentElementForRadioButton = function (pageDocument, radioButtonElement, text) {
  var spanElement = pageDocument.createElement('span');
  spanElement.innerHTML = text;

  var labelElement = pageDocument.createElement('label');
  labelElement.appendChild(radioButtonElement);
  labelElement.appendChild(spanElement);

  return labelElement;
};

OptionsPageGenerator._menuOption = function (pageDocument, option, title, subTitle) {
  var textAreaElement = pageDocument.createElement('textarea');
  textAreaElement.setAttribute('rows', 5);
  textAreaElement.setAttribute('cols', 150);
  textAreaElement.setAttribute('wrap', 'off');
  if (!Option.canGetAndSet()) {
    textAreaElement.setAttribute('disabled', true);
  }

  var restoreDefaultButtonElement = pageDocument.createElement('input');
  restoreDefaultButtonElement.setAttribute('type', 'button');
  restoreDefaultButtonElement.setAttribute('value', 'Restore Default');
  if (!Option.canGetAndSet()) {
    restoreDefaultButtonElement.setAttribute('disabled', true);
  }

  option.getValue(function (value) {
    textAreaElement.textContent = value;

    textAreaElement.addEventListener('keyup', function () {
      option.setValue(textAreaElement.value);
    }, false);

    restoreDefaultButtonElement.addEventListener('click', function () {
      textAreaElement.value = option.getDefaultValue();
      option.setValue(option.getDefaultValue());
    }, false);
  });

  return this._createTable(pageDocument, title, subTitle, [textAreaElement, restoreDefaultButtonElement]);
};

OptionsPageGenerator._createTable = function (pageDocument, title, subTitle, contentElements) {
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
  contentElements.forEach(function (tableContentElement) {
    contentsParagraphElement.appendChild(tableContentElement);
    contentsParagraphElement.appendChild(pageDocument.createElement('br'));
  });
  contentsTableDataElement.appendChild(contentsParagraphElement);

  return tableElement;
};
