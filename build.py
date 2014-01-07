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

import io
import optparse
import os
import os.path
import re
import shutil
import sys
import traceback
import zipfile
from subprocess import Popen, PIPE, STDOUT


# Read version number.
with io.open(os.path.join(sys.path[0], 'version.txt')) as f:
  version = f.read().strip()


def main(linterPath=None):
  '''Package the sources into a user script and a Google Chrome extension.'''

  linter(
    paths=[source(), test()],
    exclude=source('greasemonkey/javadoc_search_frame.js'),
    linterPath=linterPath)

  rmDirectoryContents(target())

  # Greasemonkey user script
  copyFile(
    fromPath=source('greasemonkey/javadoc_search_frame.js'),
    toPath=target('greasemonkey/javadoc_search_frame_' +
                  version.replace('.', '_') + '.user.js'),
    append=(
      source('common/_locales/en/messages.json'),
      source('greasemonkey/lib/Messages.js'),
      source('greasemonkey/lib/Storage.js'),
      source('common/lib/Option.js'),
      source('common/lib/Frames.js'),
      source('greasemonkey/lib/OptionsPage.js'),
      source('common/lib/HttpRequest.js'),
      source('common/lib/OptionsPageGenerator.js'),
      source('common/lib/common.js')
    )
  )

  # Google Chrome extension
  copyDir(fromDir=source('googlechrome'), toDir=target('googlechrome'))
  copyDir(fromDir=source('common'), toDir=target('googlechrome'))
  mkzip(
    newZipFile=target('googlechrome/javadoc_search_frame.zip'),
    contentsDir=target('googlechrome')
  )


def source(path=''):
  '''Return a path under the source directory.'''

  return os.path.abspath(os.path.join(sys.path[0], 'src', path))


def test(path=''):
  '''Return a path under the test directory.'''

  return os.path.abspath(os.path.join(sys.path[0], 'test', path))


def target(path=''):
  '''Return a path under the target directory.'''

  return os.path.abspath(os.path.join(sys.path[0], 'target', path))


def linter(paths, exclude, linterPath):
  '''
  Inspect the given paths with Closure Linter and log any warnings to the
  console. http://code.google.com/p/closure-linter/
  '''

  gjslint = 'gjslint'
  if linterPath:
    gjslint = os.path.join(linterPath, gjslint)
  args = [gjslint, '--strict', '--check_html']
  for path in paths:
    args += ['--recurse', path]
  if exclude:
    args += ['--exclude_files', exclude]
  try:
    proc = Popen(args, stdout=PIPE, stderr=STDOUT)
    output = proc.communicate()[0]
    if proc.returncode != 0:
      print(output.decode())
  except:
    traceback.print_exc(file=sys.stdout)


def rmDirectoryContents(dir):
  '''Remove the contents of the given directory.'''

  for root, dirs, files in os.walk(dir, topdown=False):
    for name in files:
      os.remove(os.path.join(root, name))
    for name in dirs:
      os.rmdir(os.path.join(root, name))


def copyFile(fromPath, toPath, append=()):
  '''
  Copy a single file, optionally appending other files to the copy.
  '''

  toPathDir = os.path.dirname(toPath)
  if not os.path.isdir(toPathDir):
    os.makedirs(toPathDir)
  fromExt = os.path.splitext(fromPath)[1]
  if fromExt == '.png':
    if append:
      raise ValueError('cannot append to binary file: ' + toPath)
    shutil.copy(fromPath, toPathDir)
  elif fromExt in ('.js', '.json', '.html'):
    with io.open(fromPath) as fromFile:
      fileContents = fromFile.read()
    # Replace #VERSION# placeholders.
    fileContents = fileContents.replace('#VERSION#', version)
    # Append files to the end.
    for appendPath in append:
      with io.open(appendPath, 'r') as appendFile:
        fileContents += '\n' + _removeLicenseHeader(appendFile.read())
    # Write file with Unix newlines.
    with io.open(toPath, 'w', newline='\n') as toFile:
      toFile.write(fileContents)
  else:
    raise ValueError('unrecognised type: ' + toPath)


def _removeLicenseHeader(scriptContents):
  '''
  Return the given script contents with the license header removed.
  '''

  licenseHeaderRegex = re.compile(r'^.*?\n\s\*/\n\n\s*(.*)', re.DOTALL)
  licenseHeaderMatch = licenseHeaderRegex.match(scriptContents)
  if licenseHeaderMatch:
    scriptContents = licenseHeaderMatch.group(1)
  return scriptContents


def copyDir(fromDir, toDir):
  '''Copy a directory.'''

  for root, dirs, files in os.walk(fromDir):
    for filename in files:
      if not filename.endswith(('.swp', '~', '.orig')):
        fromPath = os.path.join(root, filename)
        toPath = os.path.join(toDir, os.path.relpath(fromPath, fromDir))
        copyFile(fromPath=fromPath, toPath=toPath)


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
