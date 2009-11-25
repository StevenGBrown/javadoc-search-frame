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

import io, json, sys
from buildlib.build_date import *
from buildlib.file_copy import *
from buildlib.transformations import *


def buildGoogleChromeExtension():
  """
  Build the Javadoc Search Frame extension for Google Chrome.
  This extension will be created in the current working directory.
  """

  copyFile(name='allclasses-frame.js', fromDir='googlechrome', toDir='.',
    transformations=(
      insertExternalFiles(['common', 'googlechrome/lib']),
      insertValue('version', '\'' + readVersionFromManifest() + '\''),
      insertValue('buildDate', '\'' + formattedBuildDate() + '\'')
    )
  )

  copyFiles(
    names=('background.html', 'manifest.json', 'options.html', 'top.js'),
    fromDir='googlechrome', toDir='.')

  copyFiles(
    names=('icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'),
    fromDir='googlechrome/icons', toDir='icons')

  copyFile(name='Storage.js', fromDir='googlechrome/lib', toDir='lib')

  copyFiles(
    names=('Option.js', 'OptionsPageGenerator.js'),
    fromDir='common/lib', toDir='lib')


def readVersionFromManifest():
  """
  Read and return the script version from the extension manifest.
  """

  manifestPath = os.path.join(
      sys.path[0], '..', 'src', 'googlechrome', 'manifest.json')
  with io.open(manifestPath) as manifestFile:
    return json.loads(manifestFile.read())['version']


if __name__ == "__main__":
  buildGoogleChromeExtension()
