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

import io, re


def insertExternalFiles(script, includesDirectory):
  """
  Include external files into the given script.
  For example, if the script contains the line: '#INCLUDE Frames.js', then the
  file 'Frames.js' will be found in the includesDirectory and inserted in this
  location. If the inserted file has a license header, it will be removed.
  """

  includesRegex = re.compile(r'^#INCLUDE (.*)$', re.MULTILINE)
  licenseHeaderRegex = re.compile(r'^.*?\n\s\*/\n\n(.*)', re.DOTALL)

  while True:
    includesMatch = includesRegex.search(script)
    if not includesMatch:
      break
    with io.open(includesDirectory + '/' + includesMatch.group(1)) as includeFile:
      includeFileContents = includeFile.read()
      licenseHeaderMatch = licenseHeaderRegex.match(includeFileContents)
      if licenseHeaderMatch:
        includeFileContents = licenseHeaderMatch.group(1)
      script =\
          script[:includesMatch.start()] +\
          '//' + includesMatch.group() + '\n' +\
          '\n' +\
          includeFileContents.strip() +\
          script[includesMatch.end():]

  return script
