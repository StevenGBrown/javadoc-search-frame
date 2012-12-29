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


def replaceVersionPlaceholder(version):
  '''
  Return a function that will transform the script contents by replacing inline
  #VERSION# tags with the given version numebr.
  '''

  def replaceVersionPlaceholderTransformation(fileContents):
    return fileContents.replace('#VERSION#', version)

  return replaceVersionPlaceholderTransformation


def append(fileToAppend):
  '''
  Return a function that will transform the script contents by appending the
  contents of the given file, without the license header.
  '''

  def appendTransformation(fileContents):
    with io.open(fileToAppend) as f:
      return fileContents + '\n' + _removeLicenseHeader(f.read())

  return appendTransformation


def _removeLicenseHeader(scriptContents):
  '''
  Return the given script contents with the license header removed.
  '''

  licenseHeaderRegex = re.compile(r'^.*?\n\s\*/\n\n\s*(.*)', re.DOTALL)
  licenseHeaderMatch = licenseHeaderRegex.match(scriptContents)
  if licenseHeaderMatch:
    scriptContents = licenseHeaderMatch.group(1)
  return scriptContents

