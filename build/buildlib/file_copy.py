"""
The MIT License

Copyright (c) 2010 Steven G. Brown

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

import distutils.dir_util, fnmatch, io, os, shutil, sys
from . import static_analysis


def copyFile(name, fromDir, toDir, transformations=()):
  """
  Copy a single file.
  name: Name of the file.
  fromDir: Directory containing the file, relative to the source directory.
  toDir: Directory to copy this file to, relative to the current directory.
  transformations: Transformations to apply the contents of this file during
                   the copy operation (the original file will be unchanged).
  """

  fromPath = os.path.join(fromDir, name)
  toPath = os.path.join(toDir, name)
  copyAndRenameFile(fromPath, toPath, transformations)


def copyFiles(names, fromDir, toDir, transformations=()):
  """
  Copy multiple files.
  names: Names of the files.
  fromDir: Directory containing the file, relative to the source directory.
  toDir: Directory to copy this file to, relative to the current directory.
  transformations: Transformations to apply the contents of this file during
                   the copy operation (the original file will be unchanged).
  """

  for name in names:
    copyFile(name, fromDir, toDir, transformations)


def copyAndRenameFile(fromPath, toPath, transformations=()):
  """
  Copy and rename a single file.
  fromPath: Path to the file, relative to the source directory.
  toPath: Path to copy this file to, relative to the current directory.
  transformations: Transformations to apply the contents of this file during
                   the copy operation (the original file will be unchanged).
  """

  absFromPath = os.path.abspath(
      os.path.join(sys.path[0], '..', 'src', fromPath))
  absToPath = os.path.abspath(toPath)
  absToPathDir = os.path.dirname(absToPath)
  distutils.dir_util.mkpath(absToPathDir)
  if len(transformations) is 0:
    shutil.copy(absFromPath, absToPathDir)
  else:
    with io.open(absFromPath) as fromFile:
      fileContents = fromFile.read()
    for transformation in transformations:
      fileContents = transformation(fileContents)
    with io.open(absToPath, 'w', newline='\n') as toFile:
      toFile.write(fileContents)
  static_analysis.analyse(absToPath)


def copyDir(fromDir, toDir):
  """
  Copy a directory.
  fromDir: Directory to copy, relative to the source directory.
  toDir: Location to copy this directory to, relative to the current directory.
  """

  absFromDir = os.path.abspath(
      os.path.join(sys.path[0], '..', 'src', fromDir))
  absToDir = os.path.abspath(toDir)
  for root, dirs, files in os.walk(absFromDir):
    for file in [f for f in files if not _junkFile(f)]:
      sourceFile = os.path.join(root, file)
      static_analysis.analyse(sourceFile)
      targetFile = os.path.join(absToDir,
          os.path.relpath(sourceFile, absFromDir))
      targetFileDir = os.path.dirname(targetFile)
      if not os.path.isdir(targetFileDir):
        os.makedirs(targetFileDir)
      shutil.copyfile(sourceFile, targetFile)


def _junkFile(fileName):
  """
  Determine whether the given path points to a junk file.
  filename: The file name path to test.
  """

  patterns = [
    '.*.swp', # Vim swap file.
    '*~',     # Vim backup file, created on save.
    '*.orig'  # TortoiseHg backup file, created on revert.
  ]
  for pattern in patterns:
    if fnmatch.fnmatch(fileName, pattern):
      return True
  return False
