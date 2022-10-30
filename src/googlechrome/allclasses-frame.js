/**
 * Entry point of this script; called when the script has loaded.
 */
function main() {

  // Version of this script. This value is set by the build script.
  var version = '#VERSION#';

  var startupLogMessage =
      'Javadoc Search Frame ' + version + ' (Google Chrome Extension)\n' +
      'https://github.com/StevenGBrown/javadoc-search-frame\n' +
      navigator.userAgent + '\n';

  console.log(startupLogMessage);

  Storage.get(Option.HIDE_PACKAGE_FRAME, function(hidePackageFrame) {
    if (hidePackageFrame && window.top !== window) {
      if (document.location.protocol === 'file:') {
        // Content scripts on local pages cannot access the parent document.
        chrome.runtime.sendMessage({operation: 'hide-allpackages-frame'});
      } else {
        // This way seems to load faster. Do it if possible.
        Frames.hideAllPackagesFrame(parent.document);
      }
    }

    init(hidePackageFrame);

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if (request === 'focus-on-search-field') {
            View.focusOnSearchField();
          } else if (request === 'clear-search-field') {
            View.clearSearchField();
          }
        }
    );
  });
}


// Call the main method.
main();
