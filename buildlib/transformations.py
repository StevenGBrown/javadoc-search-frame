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

import io, os, re


def insertValue(includeTagName, value):
  '''
  Return a function that will transform the script contents by replacing an
  inline #INCLUDE tag with the given value. For example, if this function is
  called with includeTagName='version' and value='1.0', then any occurances of
  '#INCLUDE version' in the given script will be replaced with '1.0'.
  '''

  def insertValueTransformation(fileContents):
    return fileContents.replace('#INCLUDE ' + includeTagName + '#', value)

  return insertValueTransformation


def insertExternalFiles(*includesDirectories):
  '''
  Return a function that will transform the script contents by including the
  contents of external files. For example, if the script contains the line:
  '#INCLUDE Frames.js;', then the file 'Frames.js' will be found in one of the
  includes directories and inserted in this location. If the inserted file has
  a license header, it will be removed. If the file to be inserted cannot be
  found, a ValueError will be thrown.
  '''

  includesRegex = re.compile(r'^#INCLUDE ([^;]*);$', re.MULTILINE)

  def insertExternalFilesTransformation(fileContents):
    while True:
      includesMatch = includesRegex.search(fileContents)
      if not includesMatch:
        break
      with io.open(_findFile(includesDirectories, includesMatch.group(1))) as includeFile:
        includeFileContents = _removeLicenseHeader(includeFile.read())
        leadingFileContents = fileContents[:includesMatch.start()]
        trailingFileContents = fileContents[includesMatch.end():]
        if len(trailingFileContents) >= 2 and trailingFileContents[:2] != '\n\n':
          trailingFileContents = '\n\n' + trailingFileContents
        fileContents =\
            leadingFileContents +\
            '//' + includesMatch.group() + '\n' +\
            '\n' +\
            includeFileContents.strip() +\
            trailingFileContents
    return fileContents

  return insertExternalFilesTransformation


def _findFile(searchDirectories, filename):
  '''
  Find a file in the given list of search directories. If found, the absolute
  path to this file will be returned. Otherwise, a ValueError will be thrown.
  '''

  for directory in searchDirectories:
    absolutePath = os.path.join(directory, filename)
    if os.path.exists(absolutePath):
      return absolutePath
  raise ValueError('\'' + filename + '\' not found in ' + str(searchDirectories))


def _removeLicenseHeader(scriptContents):
  '''
  Return the given script contents with the license header removed.
  '''

  licenseHeaderRegex = re.compile(r'^.*?\n\s\*/\n\n\s*(.*)', re.DOTALL)
  licenseHeaderMatch = licenseHeaderRegex.match(scriptContents)
  if licenseHeaderMatch:
    scriptContents = licenseHeaderMatch.group(1)
  return scriptContents


def prepend(filePath):
  '''
  Return a function that will transform the script contents by prepending the
  contents of the given file.
  '''

  with io.open(filePath) as fileToPrepend:
    fileToPrependContents = fileToPrepend.read()

  def prependTransformation(fileContents):
    return fileToPrependContents + '\n' + fileContents

  return prependTransformation
