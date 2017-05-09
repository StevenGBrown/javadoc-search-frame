/**
 * The MIT License
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


chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason !== 'install' && details.reason !== 'update') {
    return;
  }
  chrome.storage.local.get('optionsMigrated', function(items) {
    if (items.optionsMigrated) {
      return;
    }
    console.log('Migrating options from localStorage');
    var itemsToSave = {};
    var ver = '1.4.6';
    var autoOpen = localStorage.getItem('auto_open');
    if (autoOpen === 'true') {
      itemsToSave['auto_open'] = {'value': true, 'version': ver};
    }
    var hidePackageFrame = localStorage.getItem('hide_package_frame');
    if (hidePackageFrame === 'false') {
      itemsToSave['hide_package_frame'] = {'value': false, 'version': ver};
    }
    var packageMenu = localStorage.getItem('package_menu');
    var packageMenuDefault =
        '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##\n' +
        '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';
    if (packageMenu && packageMenu !== packageMenuDefault) {
      itemsToSave['package_menu'] = {'value': packageMenu, 'version': ver};
    }
    var classMenu = localStorage.getItem('class_menu');
    var classMenuDefault =
        '@1:search(koders) -> http://www.koders.com/' +
        '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
        '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
        '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
        '##PACKAGE_PATH##/##CLASS_NAME##.java.html';
    if (classMenu && classMenu !== classMenuDefault) {
      itemsToSave['class_menu'] = {'value': classMenu, 'version': ver};
    }
    chrome.storage.sync.set(itemsToSave);
    console.log(itemsToSave);
    chrome.storage.local.set({'optionsMigrated': true});
  });
});

function openOptionsPage(sender) {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    var tabProperties = {
      windowId: sender.tab.windowId,
      index: sender.tab.index + 1,
      url: chrome.extension.getURL('options.html')
    };
    chrome.tabs.create(tabProperties);
  }
}

function hideAllPackagesFrame(sender) {
  chrome.webNavigation.getFrame({
    tabId: sender.tab.id,
    frameId: sender.frameId
  }, function (details) {
    chrome.tabs.executeScript(sender.tab.id, {
      file: 'lib/Frames.js',
      frameId: details.parentFrameId
    }, function() {
      chrome.tabs.executeScript(sender.tab.id, {
        code: 'Frames.hideAllPackagesFrame(document)',
        frameId: details.parentFrameId
      });
    });
  });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.operation === 'open-options-page') {
        openOptionsPage(sender);
        sendResponse();
        return false;
      }
      if (request.operation === 'hide-allpackages-frame') {
        hideAllPackagesFrame(sender);
        sendResponse();
        return false;
      }
    }
);

chrome.commands.onCommand.addListener(function(command) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabs.forEach(function(tab) {
      chrome.tabs.sendMessage(tab.id, command);
    });
  });
});

