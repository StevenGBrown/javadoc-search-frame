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


def insertExternalFiles(script, includesDirectories):
  """
  Include external files into the given script.
  For example, if the script contains the line: '#INCLUDE Frames.js', then the
  file 'Frames.js' will be found in the includes directories and inserted in
  this location. If the inserted file has a license header, it will be removed.
  """

  includesDirectories = [os.path.normpath(directory) for directory in includesDirectories]

  includesRegex = re.compile(r'^#INCLUDE (.*)$', re.MULTILINE)
  licenseHeaderRegex = re.compile(r'^.*?\n\s\*/\n\n(.*)', re.DOTALL)

  while True:
    includesMatch = includesRegex.search(script)
    if not includesMatch:
      break
    with io.open(findFile(includesDirectories, includesMatch.group(1))) as includeFile:
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


def findFile(searchDirectories, filename):
  """
  Find a file in the given list of search directories. If found, the absolute
  path to this file will be returned. Otherwise, a ValueError will be thrown.
  """

  for directory in searchDirectories:
    absolutePath = os.path.join(directory, filename)
    if os.path.exists(absolutePath):
      return absolutePath
  raise ValueError('\'' + filename + '\' not found in ' + str(searchDirectories))
