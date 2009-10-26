"""
Prepare a release of the Javadoc Search Frame script.

Developed with Python v3.0.1
"""

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

import datetime, io, re


# Main function
def main():

  filename = 'javadoc_search_frame';
  extension = '.user.js'
  releaseDate = datetime.date.today()

  # Read the script from the parent directory
  script = io.open('../' + filename + extension).read()
  splitResult = re.compile(r'(^.*?\n\*/)', re.DOTALL).split(script)
  scriptHeader, scriptBody = splitResult[1:]

  # Transform the script contents
  releaseScriptHeader = transformScriptHeader(scriptHeader, releaseDate)
  releaseScriptBody = transformScriptBody(scriptBody)

  # Write the script to a new file in the current directory
  releaseScript = releaseScriptHeader + releaseScriptBody
  releaseScriptFilename = filename + '_' + releaseDate.strftime('%Y%m%d') + extension
  io.open(releaseScriptFilename, 'w', newline='\n').write(releaseScript)


# Transform the script header. This header consists of the Greasemonkey
# metadata block, the SCRIPT_META_DATA Javascript variable and the license.
def transformScriptHeader(header, releaseDate):

  # Determine the release version.
  version = releaseDate.strftime('%d' + getOrdinalIndicator(releaseDate.day) + ' %B %Y')

  # Set the release version in the Greasemonkey metadata block.
  header = re.compile(r'// @version       DEVELOPMENT').sub(
      r'// @version       ' + version, header);

  # Set the release version in the SCRIPT_META_DATA Javascript variable.
  header = re.compile('    version : \'DEVELOPMENT\',').sub(
      '    version : \'' + version + '\',', header);

  return header


# Transform the script body (the remainder of the script not including the
# header) by removing commenting. This is done to reduce the file size.
def transformScriptBody(body):

  # Remove block comments
  body = re.compile(r'\n */\*.*?\*/', re.DOTALL).sub('\n', body)

  # Remove single-line comments
  body = re.compile(r'\n *//.*').sub('', body)

  # Remove excess newline characters
  # These may be left-over after removing the comments
  body = re.compile(r'\n{2,}').sub('\n\n', body)

  return body


# Get the ordinal indicator for the given number.
def getOrdinalIndicator(number):

  if (number < 10 or number > 20):
    leastSignificantDigit = number % 10
    if (leastSignificantDigit == 1):
      return 'st'
    if (leastSignificantDigit == 2):
      return 'nd'
    if (leastSignificantDigit == 3):
      return 'rd'
  return 'th'


# Call the main function
if __name__ == "__main__":
  main()
