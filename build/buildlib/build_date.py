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

import datetime


def format(buildDate):
  """Return the given date, in the build date format."""

  formattedBuildDate = buildDate.strftime(
      '%d' + getOrdinalIndicator(buildDate.day) + ' %B %Y')
  if formattedBuildDate[0] == '0':
    formattedBuildDate = formattedBuildDate[1:]
  return formattedBuildDate


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
