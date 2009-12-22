"""
The MIT License

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

import io, sys
from buildlib.build_date import *
from buildlib.file_copy import *
from buildlib.transformations import *


def buildGreasemonkeyUserScript():
  """
  Build the Javadoc Search Frame user script for Greasemonkey.
  This script will be created in the current working directory.
  """

  copyAndRenameFile(
    fromPath='greasemonkey/allclasses-frame.js',
    toPath='javadoc_search_frame_' + buildDate().strftime('%Y%m%d') + '.user.js',
    transformations=(
      prepend('greasemonkey/metadata_block.txt'),
      insertValue('unquotedBuildDate', formattedBuildDate()),
      insertExternalFiles(['common/includes', 'greasemonkey/includes']),
      insertValue('buildDate', '\'' + formattedBuildDate() + '\''),
    )
  )


if __name__ == "__main__":
  buildGreasemonkeyUserScript()
