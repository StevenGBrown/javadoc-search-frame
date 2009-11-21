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

  this._initialise(document);
};

OptionsPageGenerator._createContents = function (pageDocument) {
  var contents = [];
  contents.push(this._createHeader(pageDocument));
  contents.push(pageDocument.createElement('p'));
  if (!UserPreference.canGetAndSet()) {
    contents.push(this._createOptionsCannotBeConfiguredErrorMessage(pageDocument));
    contents.push(pageDocument.createElement('p'));
  }
  contents.push(this._booleanOption(
      pageDocument, UserPreference.AUTO_OPEN, 'Automatic Opening of Links',
      'On. Automatically open the first package, class or method in the list after each search.',
      'Off. Wait for the <tt>Enter</tt> key to be pressed.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._booleanOption(
      pageDocument, UserPreference.HIDE_PACKAGE_FRAME, 'Merge the Package and Class Frames',
      'Yes. All packages and classes can be searched using a single combined frame.',
      'No. The package frame will not be hidden. Only one package can be searched at a time.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._menuOption(
      pageDocument, UserPreference.CLASS_MENU, 'Class/Method Menu',
      'Menu displayed when pressing the <tt>@</tt> key if a class or method is ' +
      'currently displayed at the top of the search list.'));
  contents.push(pageDocument.createElement('p'));
  contents.push(this._menuOption(
      pageDocument, UserPreference.PACKAGE_MENU, 'Package Menu',
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

OptionsPageGenerator._booleanOption = function (pageDocument, preference, title, trueText, falseText) {
  var key = preference.getKey();
  var trueDefault = preference.getDefaultValue();

  var trueRadioButtonHTML = this._radioButton({
      name : key, id : key + '_true', text : trueText,
      isChecked : false, isDisabled : !UserPreference.canGetAndSet(), isDefault : trueDefault});
  var falseRadioButtonHTML = this._radioButton({
      name : key, id : key + '_false', text : falseText,
      isChecked : false, isDisabled : !UserPreference.canGetAndSet(), isDefault : !trueDefault});

  return this._createTable(pageDocument, title, '',
      trueRadioButtonHTML + '<br/>' +
      falseRadioButtonHTML);
};

OptionsPageGenerator._radioButton = function (args) {
  var radioButtonHTML = '<label>' +
      '<input id="' + args.id + '" type=radio name="' + args.name + '" value="true"';
  if (args.isChecked) {
    radioButtonHTML += ' checked="true"';
  }
  if (args.isDisabled) {
    radioButtonHTML += ' disabled="true"';
  }
  radioButtonHTML += '/>' + args.text;
  if (args.isDefault) {
    radioButtonHTML += ' (Default)';
  }
  radioButtonHTML += '</label>';
  return radioButtonHTML;
};

OptionsPageGenerator._menuOption = function (pageDocument, preference, title, subTitle) {
  var key = preference.getKey();
  var textAreaId = key + '_text_area';
  var restoreDefaultButtonId = key + '_restore_default_button';

  var textAreaHTML = '<textarea id="' + textAreaId + '" rows="5" cols="150" wrap="off"';
  if (!UserPreference.canGetAndSet()) {
    textAreaHTML += ' disabled="true"';
  }
  textAreaHTML += '></textarea>';

  var restoreDefaultButtonHTML = '<input id="' + restoreDefaultButtonId + '"';
  if (!UserPreference.canGetAndSet()) {
    restoreDefaultButtonHTML += ' disabled="true"';
  }
  restoreDefaultButtonHTML += ' type=button value="Restore Default"/>';

  return this._createTable(pageDocument, title, subTitle,
      textAreaHTML + '<br/>' +
      restoreDefaultButtonHTML);
};

OptionsPageGenerator._createTable = function (pageDocument, title, subTitle, contents) {
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
  contentsParagraphElement.innerHTML = contents;
  contentsTableDataElement.appendChild(contentsParagraphElement);

  return tableElement;
};

OptionsPageGenerator._initialise = function (pageDocument) {
  var optionsGenerator = this;
  optionsGenerator._initialiseBooleanOption(pageDocument, UserPreference.AUTO_OPEN, function () {
    optionsGenerator._initialiseBooleanOption(pageDocument, UserPreference.HIDE_PACKAGE_FRAME, function () {
      optionsGenerator._initialiseMenuOption(pageDocument, UserPreference.CLASS_MENU, function () {
        optionsGenerator._initialiseMenuOption(pageDocument, UserPreference.PACKAGE_MENU);
      });
    });
  });
};

OptionsPageGenerator._initialiseBooleanOption = function (pageDocument, preference, completionCallback) {
  var key = preference.getKey();
  var trueRadioButton = pageDocument.getElementById(key + '_true');
  var falseRadioButton = pageDocument.getElementById(key + '_false');

  preference.getValue(function (value) {
    var radioButtonToCheck = value ? trueRadioButton : falseRadioButton;
    radioButtonToCheck.setAttribute("checked", "true");

    var clickEventListener = function () {
      preference.setValue(trueRadioButton.checked);
    };

    trueRadioButton.addEventListener('click', clickEventListener, false);
    falseRadioButton.addEventListener('click', clickEventListener, false);

    if (completionCallback) {
      completionCallback();
    }
  });
};

OptionsPageGenerator._initialiseMenuOption = function (pageDocument, preference, completionCallback) {
  var key = preference.getKey();
  var textAreaId = key + '_text_area';
  var textAreaElement = pageDocument.getElementById(textAreaId);

  preference.getValue(function (value) {
    textAreaElement.textContent = value;

    textAreaElement.addEventListener('keyup', function () {
      preference.setValue(textAreaElement.value);
    }, false);

    var restoreDefaultButtonId = key + '_restore_default_button';
    var restoreDefaultButton = pageDocument.getElementById(restoreDefaultButtonId);
    restoreDefaultButton.addEventListener('click', function () {
      textAreaElement.value = preference.getDefaultValue();preference.setValue(preference.getDefaultValue());
    }, false);

    if (completionCallback) {
      completionCallback();
    }
  });
};
