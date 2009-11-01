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

import datetime, io, sys
from buildlib import metadata


def buildGreasemonkeyUserScript():
  """
  Build the Javadoc Search Frame user script for Greasemonkey.
  This script will be created in the current working directory.
  """

  buildDate = datetime.date.today()

  script = ''
  with io.open(sys.path[0] + '/../src/common/common.js') as file:
    script = file.read()

  script = prependGreasemonkeyMetadataBlock(script, buildDate);

  userScriptFilename = 'javadoc_search_frame_' + buildDate.strftime('%Y%m%d') + '.user.js'
  with io.open(userScriptFilename, 'w', newline='\n') as file:
    file.write(script)


def prependGreasemonkeyMetadataBlock(script, buildDate):
  """Prepend the Greasemonkey metadata block to the given script."""

  scriptMetadata = metadata.read(script)

  version = buildDate.strftime('%d' + getOrdinalIndicator(buildDate.day) + ' %B %Y')
  if version[0] == '0':
    version = version[1:]
  includes = ''
  for include in scriptMetadata['includes']:
    includes += '// @include       ' + include + '\n'

  greasemonkeyMetadataBlock =\
      '// ==UserScript==\n' +\
      '// @name          ' + scriptMetadata['name'] + '\n' +\
      '// @namespace     http://userscripts.org/users/46156\n' +\
      '// @description   ' + scriptMetadata['description'] + '\n' +\
      '// @homepage      ' + scriptMetadata['homepage'] + '\n' +\
      '// @version       ' + version + '\n' +\
      includes +\
      '// ==/UserScript==\n'

  return greasemonkeyMetadataBlock + '\n' + script


def getOrdinalIndicator(number):
  """Return the ordinal indicator for the given number."""

  if (number < 10 or number > 20):
    leastSignificantDigit = number % 10
    if (leastSignificantDigit == 1):
      return 'st'
    if (leastSignificantDigit == 2):
      return 'nd'
    if (leastSignificantDigit == 3):
      return 'rd'
  return 'th'


if __name__ == "__main__":
  buildGreasemonkeyUserScript()
