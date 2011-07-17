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

import distutils.dir_util, fnmatch, io, os, shutil, sys


def copyFile(name, fromDir, toDir, transformations=()):
  '''
  Copy the file with the given name from the source directory to the
  destination directory, applying the given transformations to the file
  contents.
  '''

  fromPath = os.path.join(fromDir, name)
  toPath = os.path.join(toDir, name)
  copyAndRenameFile(fromPath, toPath, transformations)


def copyFiles(names, fromDir, toDir, transformations=()):
  '''
  Copy the files with the given names from the source directory to the
  destination directory, applying the given transformations to the file
  contents.
  '''

  for name in names:
    copyFile(name, fromDir, toDir, transformations)


def copyAndRenameFile(fromPath, toPath, transformations=()):
  '''
  Copy and rename a single file, applying the given transformations to the
  file contents.
  '''

  toPathDir = os.path.dirname(toPath)
  distutils.dir_util.mkpath(toPathDir)
  if len(transformations) == 0:
    shutil.copy(fromPath, toPathDir)
  else:
    with io.open(fromPath) as fromFile:
      fileContents = fromFile.read()
    for transformation in transformations:
      fileContents = transformation(fileContents)
    with io.open(toPath, 'w', newline='\n') as toFile:
      toFile.write(fileContents)


def copyDir(fromDir, toDir):
  '''Copy a directory.'''

  for root, dirs, files in os.walk(fromDir):
    for file in [f for f in files if not _junkFile(f)]:
      sourceFile = os.path.join(root, file)
      targetFile = os.path.join(toDir,
          os.path.relpath(sourceFile, fromDir))
      targetFileDir = os.path.dirname(targetFile)
      if not os.path.isdir(targetFileDir):
        os.makedirs(targetFileDir)
      shutil.copyfile(sourceFile, targetFile)


def _junkFile(fileName):
  '''Determine whether the given path points to a junk file.'''

  patterns = [
    '.*.swp', # Vim swap file.
    '*~',     # Vim backup file, created on save.
    '*.orig'  # TortoiseHg backup file, created on revert.
  ]
  for pattern in patterns:
    if fnmatch.fnmatch(fileName, pattern):
      return True
  return False
