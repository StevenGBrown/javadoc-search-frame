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

import io, os, re


def analyse(filePath):
  """
  Analyse the file at the given location and log any warnings to the console.
  """

  if isText(filePath):
    with io.open(filePath) as file:
      fileContents = file.read()
    log = createLogger(filePath)
    checkForTabCharacters(fileContents, log)
    checkForReturnJsdocTag(fileContents, log)
    checkForMissingPrivateJsdocTag(fileContents, log)


def isText(filePath):
  """
  Return true if the file at the given location is a text file, false
  otherwise.
  """

  textExtensions = ['.js', '.json', 'html']
  return any([filePath.endswith(extension) for extension in textExtensions])


def createLogger(filePath):
  """
  Return a function that takes a line number and a warning message as arguments
  and will log this message to the console.
  """

  fileName = os.path.basename(filePath)

  def log(lineNumber, warningMessage):
    print(fileName + ':' + str(lineNumber) + ' ' + warningMessage)

  return log


def getLineNumber(inputString, position):
  """
  Return the line number of the given character position.
  """

  return inputString.count('\n', 0, position) + 1;


def checkForTabCharacters(fileContents, log):
  """
  Log a warning message if any tab characters are found in the given file
  contents.
  """

  lines = fileContents.splitlines()
  for lineNumber, line in zip(range(1, len(lines) + 1), lines):
    if line.find('\t') != -1:
      log(lineNumber, 'tab character found')


def checkForReturnJsdocTag(fileContents, log):
  """
  Log a warning message if the '@return' tag is found in the given file
  contents. This is not a valid Jsdoc tag: it should be '@returns'.
  """

  lines = fileContents.splitlines();
  for lineNumber, line in zip(range(1, len(lines) + 1), lines):
    if line.find('@return ') != -1:
      log(lineNumber, 'found @return tag, should be @returns')


def checkForMissingPrivateJsdocTag(fileContents, log):
  """
  Log a warning message if a '@private' tag is missing from the given file
  contents. The convention in use is to start the name of a private function
  with an underscore.
  """

  matches = re.finditer(r'/\*(.*?)\*/([^= ]*)', fileContents, re.DOTALL)
  for match in matches:
    functionDoc = match.group(1)
    functionName = match.group(2).strip()
    if functionDoc.find('@private') == -1 and functionName.find('._') != -1:
      lineNumber = getLineNumber(fileContents, match.end())
      log(lineNumber, 'missing @private tag for ' + functionName)
