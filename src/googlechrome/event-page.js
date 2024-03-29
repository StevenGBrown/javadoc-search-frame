chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason !== 'install' && details.reason !== 'update') {
    return;
  }
  chrome.storage.local.get('optionsMigrated', function (items) {
    if (items.optionsMigrated) {
      return;
    }
    console.log('Migrating options from localStorage');
    var itemsToSave = {};
    var ver = '1.4.6';
    var autoOpen = localStorage.getItem('auto_open');
    if (autoOpen === 'true') {
      itemsToSave['auto_open'] = { value: true, version: ver };
    }
    var hidePackageFrame = localStorage.getItem('hide_package_frame');
    if (hidePackageFrame === 'false') {
      itemsToSave['hide_package_frame'] = { value: false, version: ver };
    }
    var packageMenu = localStorage.getItem('package_menu');
    var packageMenuDefault =
      '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';
    if (packageMenu && packageMenu !== packageMenuDefault) {
      itemsToSave['package_menu'] = { value: packageMenu, version: ver };
    }
    var classMenu = localStorage.getItem('class_menu');
    var classMenuDefault =
      '@1:search(koders) -> http://www.koders.com/' +
      '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html';
    if (classMenu && classMenu !== classMenuDefault) {
      itemsToSave['class_menu'] = { value: classMenu, version: ver };
    }
    chrome.storage.sync.set(itemsToSave);
    console.log(itemsToSave);
    chrome.storage.local.set({ optionsMigrated: true });
  });
});

function hideAllPackagesFrame(sender) {
  chrome.webNavigation.getFrame(
    {
      tabId: sender.tab.id,
      frameId: sender.frameId,
    },
    function (details) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id, frameIds: [details.parentFrameId] },
        func: Frames.hideAllPackagesFrame,
      });
    }
  );
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.operation === 'open-options-page') {
    chrome.runtime.openOptionsPage();
    sendResponse();
    return false;
  }
  if (request.operation === 'hide-allpackages-frame') {
    hideAllPackagesFrame(sender);
    sendResponse();
    return false;
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, command);
    });
  });
});
