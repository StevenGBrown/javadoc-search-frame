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

import datetime, io, json, os, sys
from buildlib.file_copy import *
from buildlib.linter import *
from buildlib.paths import *
from buildlib.transformations import *


def buildGreasemonkeyUserScript(version, buildYear):
  '''Build the Javadoc Search Frame user script for Greasemonkey.'''

  copyAndRenameFile(
    fromPath=source('greasemonkey/allclasses-frame.js'),
    toPath=target('greasemonkey/javadoc_search_frame_' +
                  version.replace('.', '_') + '.user.js'),
    transformations=(
      prepend(source('greasemonkey/metadata_block.txt')),
      insertExternalFiles(
          source('common/_locales/en'),
          source('common/includes'),
          source('greasemonkey/includes')
      ),
      insertValue('version', version),
      insertValue('buildYear', buildYear)
    )
  )


def buildGoogleChromeExtension(version, buildYear):
  '''Build the Javadoc Search Frame extension for Google Chrome.'''

  copyFiles(
    names=('allclasses-frame.js', 'background.html',
           'collect-class-members-and-keywords.js', 'hide-packages-frame.js',
           'manifest.json', 'options.js', 'options.html'),
    fromDir=source('googlechrome'),
    toDir=target('googlechrome'),
    transformations=(
      insertExternalFiles(
          source('common/includes'),
          source('googlechrome/includes')
      ),
      insertValue('version', version),
      insertValue('buildYear', buildYear)
    )
  )

  copyFiles(
    names=('icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'),
    fromDir=source('googlechrome/icons'),
    toDir=target('googlechrome/icons')
  )

  copyDir(
    fromDir=source('common/_locales'),
    toDir=target('googlechrome/_locales')
  )


def version():
  '''Retrieve the version number.'''

  with io.open(os.path.join(sys.path[0], 'version.txt')) as f:
    return f.read().strip()


def buildYear():
  '''Return the year component of the build date.'''

  return datetime.date.today().strftime('%Y')


if __name__ == '__main__':
  linter(source())
  version = version()
  buildYear = buildYear()
  buildGreasemonkeyUserScript(version, buildYear)
  buildGoogleChromeExtension(version, buildYear)
