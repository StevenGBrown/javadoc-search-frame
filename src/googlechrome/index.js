// Hide the packages frame.
var framesets = document.getElementsByTagName('frameset');
if (framesets) {
  var frameset = framesets[1];
  if (frameset) {
    frameset.setAttribute('rows', '0,*');
    frameset.setAttribute('border', 0);
    frameset.setAttribute('frameborder', 0);
    frameset.setAttribute('framespacing', 0);
  }
}
