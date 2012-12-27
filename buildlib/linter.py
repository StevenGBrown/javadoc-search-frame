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

import os, sys, traceback
from subprocess import *


def linter(path, linterPath=None):
  '''
  Inspect the given path with Closure Linter and log any warnings to the
  console. http://code.google.com/p/closure-linter/
  '''

  gjslint = 'gjslint'
  if linterPath:
    gjslint = os.path.join(linterPath, gjslint)
  args = [gjslint, '-r', path, '--strict', '--check_html']
  try:
    proc = Popen(args, stdout=PIPE, stderr=STDOUT)
    output = proc.communicate()[0]
    if proc.returncode != 0:
      print(output.decode())
  except:
    traceback.print_exc(file=sys.stdout)
