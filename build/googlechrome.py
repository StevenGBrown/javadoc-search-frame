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

import io, sys
from buildlib import includes, metadata


def buildGoogleChromeExtension():
  """
  Build the Javadoc Search Frame extension for Google Chrome.
  This extension will be created in the current working directory.
  """

  allclassesFrameContentScript = ''
  with io.open(sys.path[0] + '/../src/common/allclasses-frame.js') as file:
    allclassesFrameContentScript = file.read()

  allclassesFrameContentScript = includes.insertExternalFiles(allclassesFrameContentScript, sys.path[0] + '/../src/googlechrome/includes')

  allclassesFrameContentScriptFilename = 'allclasses-frame.js'
  with io.open(allclassesFrameContentScriptFilename, 'w', newline='\n') as file:
    file.write(allclassesFrameContentScript)

  indexContentScriptFilename = 'index.js'
  with io.open(indexContentScriptFilename, 'w', newline='\n') as outputFile:
    with io.open(sys.path[0] + '/../src/googlechrome/index.js') as inputFile:
      outputFile.write(inputFile.read())

  createExtensionManifest(allclassesFrameContentScript, allclassesFrameContentScriptFilename, indexContentScriptFilename)


def createExtensionManifest(allclassesFrameContentScript, allclassesFrameContentScriptFilename, indexContentScriptFilename):
  """Create the extension manifest file."""

  scriptMetadata = metadata.read(allclassesFrameContentScript)

  matches = ''
  for match in scriptMetadata['includes']:
    matches += '          "http://*/' + match + '",\n'
    matches += '          "file://*/' + match + '",\n'
  if matches:
    matches = matches[:-2] + '\n'

  manifestContents =\
      '{\n' +\
      '  "name": "' + scriptMetadata['name'] + '",\n' +\
      '  "version" : "1.0",\n' +\
      '  "description": "' + scriptMetadata['description'] + '",\n' +\
      '  "content_scripts": [\n' +\
      '    {\n' +\
      '      "matches": [\n' +\
      matches +\
      '      ],\n' +\
      '      "js": [\n' +\
      '          "' + allclassesFrameContentScriptFilename + '"\n' +\
      '      ]\n' +\
      '    },\n' +\
      '    {\n' +\
      '      "matches": [\n' +\
      '          "http://*/*/index.html",\n' +\
      '          "file://*/*/index.html"\n' +\
      '      ],\n' +\
      '      "js": [\n' +\
      '          "' + indexContentScriptFilename + '"\n' +\
      '      ]\n' +\
      '    }\n' +\
      '  ],\n' +\
      '  "permissions": [\n' +\
      '    "tabs"\n' +\
      '  ]\n' +\
      '}\n'

  with io.open('manifest.json', 'w', newline='\n') as manifestFile:
    manifestFile.write(manifestContents)


if __name__ == "__main__":
  buildGoogleChromeExtension()
