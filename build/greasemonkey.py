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
from buildlib import build_date, includes, inline_includes


def buildGreasemonkeyUserScript():
  """
  Build the Javadoc Search Frame user script for Greasemonkey.
  This script will be created in the current working directory.
  """

  buildDate = datetime.date.today()
  formattedBuildDate = build_date.format(buildDate)

  with io.open(sys.path[0] + '/../src/greasemonkey/allclasses-frame.js') as file:
    userScript = file.read()

  userScript = includes.insertExternalFiles(userScript,
      [sys.path[0] + '/../src/common', sys.path[0] + '/../src/common/lib', sys.path[0] + '/../src/greasemonkey/lib'])
  userScript = inline_includes.insertValue(userScript, 'buildDate', '\'' + formattedBuildDate + '\'');
  userScript = prependGreasemonkeyMetadataBlock(userScript, formattedBuildDate)

  with io.open(
      'javadoc_search_frame_' + buildDate.strftime('%Y%m%d') + '.user.js', 'w', newline='\n') as file:
    file.write(userScript)


def prependGreasemonkeyMetadataBlock(userScript, formattedBuildDate):
  """Prepend the Greasemonkey metadata block to the given script."""

  with io.open(sys.path[0] + '/../src/greasemonkey/metadata_block.txt') as file:
    metadataBlock = file.read()

  metadataBlock = inline_includes.insertValue(metadataBlock, 'buildDate', formattedBuildDate);
  return metadataBlock + '\n' + userScript


if __name__ == "__main__":
  buildGreasemonkeyUserScript()
