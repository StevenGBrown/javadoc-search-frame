'''
The MIT License

Copyright (c) 2011 Steven G. Brown

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
'''


# Developed with Python v3.0.1

import io, json, sys
from buildlib.build_date import *
from buildlib.file_copy import *
from buildlib.linter import *
from buildlib.paths import *
from buildlib.transformations import *


def buildGreasemonkeyUserScript():
  '''
  Build the Javadoc Search Frame user script for Greasemonkey.
  This script will be created in the current working directory.
  '''

  copyAndRenameFile(
    fromPath=source('greasemonkey/allclasses-frame.js'),
    toPath='javadoc_search_frame_' + formattedBuildDateISO() + '.user.js',
    transformations=(
      prepend(source('greasemonkey/metadata_block.txt')),
      insertValue('unquotedBuildDate', formattedBuildDate()),
      insertExternalFiles([
          source('common/_locales/en'),
          source('common/includes'),
          source('greasemonkey/includes')
      ]),
      insertValue('buildDate', '\'' + formattedBuildDate() + '\''),
      insertValue('buildYear', buildYear())
    )
  )


def buildGoogleChromeExtension():
  '''
  Build the Javadoc Search Frame extension for Google Chrome.
  This extension will be created in the current working directory.
  '''

  copyFile(
    name='allclasses-frame.js',
    fromDir=source('googlechrome'),
    toDir='.',
    transformations=(
      insertExternalFiles([
          source('common/includes'),
          source('googlechrome/includes')
      ]),
      insertValue('version', '\'' + readVersionFromManifest() + '\''),
      insertValue('buildDate', '\'' + formattedBuildDate() + '\''),
      insertValue('buildYear', buildYear())
    )
  )

  copyFile(name='options.js', fromDir=source('googlechrome'), toDir='.',
    transformations=(
      insertExternalFiles([
          source('common/includes'),
          source('googlechrome/includes')
      ]),
      insertValue('buildYear', buildYear())
    )
  )

  copyFiles(
    names=('background.html', 'collect-class-members-and-keywords.js',
           'hide-packages-frame.js', 'manifest.json', 'options.html'),
    fromDir=source('googlechrome'), toDir='.'
  )

  copyFiles(
    names=('icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'),
    fromDir=source('googlechrome/icons'), toDir='icons'
  )

  copyDir(fromDir=source('common/_locales'), toDir='_locales')


def readVersionFromManifest():
  '''
  Read and return the script version from the extension manifest.
  '''

  manifestPath = source('googlechrome/manifest.json')
  with io.open(manifestPath) as manifestFile:
    return json.loads(manifestFile.read())['version']


if __name__ == '__main__':
  linter(source())
  buildGreasemonkeyUserScript()
  buildGoogleChromeExtension()
