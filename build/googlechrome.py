"""
This script is distributed under the MIT licence.
http://en.wikipedia.org/wiki/MIT_License

Copyright (c) 2009 Steven G. Brown

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
"""

# Developed with Python v3.0.1

import datetime, json, io, shutil, sys
from buildlib import build_date, includes, inline_includes


def buildGoogleChromeExtension():
  """
  Build the Javadoc Search Frame extension for Google Chrome.
  This extension will be created in the current working directory.
  """

  buildDate = datetime.date.today()
  formattedBuildDate = build_date.format(buildDate)

  with io.open(sys.path[0] + '/../src/googlechrome/manifest.json') as file:
    version = json.loads(file.read())['version']

  with io.open(sys.path[0] + '/../src/googlechrome/allclasses-frame.js') as file:
    allclassesFrameContentScript = file.read()

  allclassesFrameContentScript = includes.insertExternalFiles(allclassesFrameContentScript, [sys.path[0] + '/../src/common'])
  allclassesFrameContentScript = inline_includes.insertValue(allclassesFrameContentScript, 'version', '\'' + version + '\'')
  allclassesFrameContentScript = inline_includes.insertValue(allclassesFrameContentScript, 'buildDate', '\'' + formattedBuildDate + '\'');

  with io.open('allclasses-frame.js', 'w', newline='\n') as file:
    file.write(allclassesFrameContentScript)

  shutil.copy(sys.path[0] + '/../src/googlechrome/manifest.json', '.')
  shutil.copy(sys.path[0] + '/../src/googlechrome/index.js', '.')
  shutil.copy(sys.path[0] + '/../src/googlechrome/lib/Frames.js', '.')
  shutil.copy(sys.path[0] + '/../src/googlechrome/lib/Log.js', '.')
  shutil.copy(sys.path[0] + '/../src/googlechrome/lib/Storage.js', '.')
  shutil.copy(sys.path[0] + '/../src/common/lib/UserPreference.js', '.')


if __name__ == "__main__":
  buildGoogleChromeExtension()
