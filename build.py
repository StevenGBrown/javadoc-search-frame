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

import datetime, io, optparse, os, sys, zipfile
from buildlib.file_copy import *
from buildlib.linter import *
from buildlib.transformations import *


def main(linterPath=None):
  '''Package the sources into a user script and a Google Chrome extension.'''

  linter(source(), exclude=source('greasemonkey/javadoc_search_frame.js'),
         linterPath=linterPath)

  with io.open(os.path.join(sys.path[0], 'version.txt')) as f:
    version = f.read().strip()

  rmDirectoryContents(target())

  # Greasemonkey user script
  copyAndRenameFile(
    fromPath=source('greasemonkey/javadoc_search_frame.js'),
    toPath=target('greasemonkey/javadoc_search_frame_' +
                  version.replace('.', '_') + '.user.js'),
    transformations=(
      append(source('common/_locales/en/messages.json')),
      append(source('greasemonkey/lib/Messages.js')),
      append(source('greasemonkey/lib/Storage.js')),
      append(source('common/lib/Option.js')),
      append(source('greasemonkey/lib/Frames.js')),
      append(source('greasemonkey/lib/OptionsPage.js')),
      append(source('common/lib/HttpRequest.js')),
      append(source('common/lib/OptionsPageGenerator.js')),
      append(source('common/lib/common.js')),
      replaceVersionPlaceholder(version),
    )
  )

  # Google Chrome extension
  copyFiles(
    names=('all-frames.js', 'allclasses-frame.js', 'event-page.js',
           'manifest.json', 'options.js', 'options.html'),
    fromDir=source('googlechrome'),
    toDir=target('googlechrome'),
    transformations=(
      replaceVersionPlaceholder(version),
    )
  )
  copyFiles(
    names=('Frames.js', 'Messages.js', 'OptionsPage.js', 'Storage.js'),
    fromDir=source('googlechrome/lib'),
    toDir=target('googlechrome/lib')
  )
  copyFiles(
    names=('common.js', 'OptionsPageGenerator.js', 'HttpRequest.js',
           'Option.js'),
    fromDir=source('common/lib'),
    toDir=target('googlechrome/lib')
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
  mkzip(
    newZipFile=target('googlechrome/javadoc_search_frame.zip'),
    contentsDir=target('googlechrome')
  )


def source(path=''):
  '''Return a path under the source directory.'''

  return os.path.abspath(os.path.join(sys.path[0], 'src', path))


def target(path=''):
  '''Return a path under the target directory.'''

  return os.path.abspath(os.path.join(sys.path[0], 'target', path))


def rmDirectoryContents(dir):
  '''Remove the contents of the given directory.'''

  for root, dirs, files in os.walk(dir, topdown=False):
    for name in files:
      os.remove(os.path.join(root, name))
    for name in dirs:
      os.rmdir(os.path.join(root, name))


def mkzip(newZipFile, contentsDir):
  '''Create a zip file containing all files from the given directory.'''

  zipf = zipfile.ZipFile(newZipFile, 'w')
  try:
    for dirpath, dirnames, filenames in os.walk(contentsDir):
      for filename in [os.path.join(dirpath, f) for f in filenames]:
        if filename != newZipFile:
          zipf.write(filename, os.path.relpath(filename, contentsDir))
  finally:
    zipf.close()


if __name__ == '__main__':
  parser = optparse.OptionParser()
  parser.add_option('--linter',
      help='directory containing the Closure Linter executable ' +
           '(default: use the system path)')
  (options, args) = parser.parse_args()
  main(linterPath=options.linter)
