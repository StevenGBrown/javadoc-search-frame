/**
 * The MIT License
 *
 * Copyright (c) 2012 Steven G. Brown
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */


UnitTestSuite.testFunctionFor('extractUrl', function() {
  var mockLink = {};
  mockLink.getHtml = function() {
    return '<A HREF="urlOfLink"';
  };
  assertThat('', extractUrl(mockLink), is('urlOfLink'));
});


UnitTestSuite.testFunctionFor('toAbsoluteUrl', function() {
  var api = 'http://java.sun.com/javase/6/docs/api/';
  assertThat('relative to "all classes" url', toAbsoluteUrl(
      'java/applet/AppletContext.html', api + 'allclasses-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
  assertThat('relative to package url', toAbsoluteUrl(
      'java/applet/AppletContext.html', api + 'java/applet/package-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
  assertThat('already an absolute url', toAbsoluteUrl(
      api + 'java/applet/AppletContext.html', api + 'allclasses-frame.html'),
      is(api + 'java/applet/AppletContext.html'));
});


UnitTestSuite.testFunctionFor('PackageLink.getHtml', function() {
  assertThat('', new PackageLink('java.applet').getHtml(), is(
      '<A HREF="java/applet/package-summary.html" target="classFrame">' +
      'java.applet</A>'));
});


UnitTestSuite.testFunctionFor('PackageLink.getUrl', function() {
  assertThat('', new PackageLink('java.applet').getUrl(),
      is(toAbsoluteUrl('java/applet/package-summary.html')));
});


UnitTestSuite.testFunctionFor('ClassLink.getHtml', function() {
  var url = toAbsoluteUrl;
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext').getHtml(), is(
      '<A HREF="' +
      url('javax/swing/text/AbstractDocument.AttributeContext.html') +
      '" title="interface in javax.swing.text" target="classFrame"><I>' +
      'AbstractDocument.AttributeContext</I></A>&nbsp;[&nbsp;' +
      'javax.swing.text&nbsp;]'));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util',
      'AbstractAnnotationValueVisitor6').getHtml(), is(
      '<A HREF="' +
      url('javax/lang/model/util/AbstractAnnotationValueVisitor6.html') +
      '" title="class in javax.lang.model.util" target="classFrame">' +
      'AbstractAnnotationValueVisitor6</A>&nbsp;[&nbsp;javax.lang.model.util' +
      '&nbsp;]'));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang',
      'Thread.State').getHtml(), is(
      '<A HREF="' +
      url('java/lang/Thread.State.html') +
      '" title="enum in java.lang" ' +
      'target="classFrame">Thread.State</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException').getHtml(), is(
      '<A HREF="' +
      url('java/security/AccessControlException.html') +
      '" title="class in java.security" target="classFrame">' +
      'AccessControlException</A>&nbsp;[&nbsp;java.security&nbsp;]'));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation',
      'AnnotationFormatError').getHtml(), is(
      '<A HREF="' +
      url('java/lang/annotation/AnnotationFormatError.html') +
      '" title="class in java.lang.annotation" target="classFrame">' +
      'AnnotationFormatError</A>&nbsp;[&nbsp;java.lang.annotation&nbsp;]'));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang',
      'Deprecated').getHtml(), is(
      '<A HREF="' +
      url('java/lang/Deprecated.html') +
      '" title="annotation in java.lang" ' +
      'target="classFrame">Deprecated</A>&nbsp;[&nbsp;java.lang&nbsp;]'));
});


UnitTestSuite.testFunctionFor('ClassLink.getUrl', function() {
  assertThat('interface', new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext').getUrl(), is(toAbsoluteUrl(
      'javax/swing/text/AbstractDocument.AttributeContext.html')));
  assertThat('class', new ClassLink(LinkType.CLASS, 'javax.lang.model.util',
      'AbstractAnnotationValueVisitor6').getUrl(), is(toAbsoluteUrl(
      'javax/lang/model/util/AbstractAnnotationValueVisitor6.html')));
  assertThat('enum', new ClassLink(LinkType.ENUM, 'java.lang',
      'Thread.State').getUrl(), is(toAbsoluteUrl(
      'java/lang/Thread.State.html')));
  assertThat('exception', new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException').getUrl(), is(toAbsoluteUrl(
      'java/security/AccessControlException.html')));
  assertThat('error', new ClassLink(LinkType.ERROR, 'java.lang.annotation',
      'AnnotationFormatError').getUrl(), is(toAbsoluteUrl(
      'java/lang/annotation/AnnotationFormatError.html')));
  assertThat('annotation', new ClassLink(LinkType.ANNOTATION, 'java.lang',
      'Deprecated').getUrl(), is(toAbsoluteUrl('java/lang/Deprecated.html')));
});


UnitTestSuite.testFunctionFor('RegexLibrary.createCondition', function() {
  var javaAwtGeomPoint2DClass = new ClassLink(LinkType.CLASS,
      'java.awt.geom', 'Point2D');
  var javaAwtGeomPoint2DDoubleClass = new ClassLink(LinkType.CLASS,
      'java.awt.geom', 'Point2D.Double');
  var javaIoPackage = new PackageLink('java.io');
  var javaLangPackage = new PackageLink('java.lang');
  var javaIoCloseableClass = new ClassLink(LinkType.CLASS,
      'java.io', 'Closeable');
  var javaLangObjectClass = new ClassLink(LinkType.CLASS,
      'java.lang', 'Object');
  var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS,
      'javax.swing', 'BorderFactory');
  var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS,
      'javax.swing.border', 'AbstractBorder');
  var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS,
      'org.omg.CORBA', 'Object');
  var hudsonPackage = new PackageLink('hudson');
  var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS,
      'hudson.model', 'Hudson');
  var testOuterAppleBananaClass = new ClassLink(LinkType.CLASS,
      'test', 'Outer.Apple.Banana');

  var allLinks = [javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
    javaIoPackage, javaLangPackage, javaIoCloseableClass,
    javaLangObjectClass, javaxSwingBorderFactoryClass,
    javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass,
    hudsonPackage, hudsonModelHudsonClass, testOuterAppleBananaClass];

  var assertThatSearchResultFor = function(searchString, searchResult) {
    assertThat(UnitTestSuite.quote(searchString),
        allLinks.filter(RegexLibrary.createCondition(searchString)),
        is(searchResult));
  };

  assertThatSearchResultFor('java.io',
      is([javaIoPackage, javaIoCloseableClass]));
  assertThatSearchResultFor('JI',
      is([javaIoPackage, javaIoCloseableClass]));
  assertThatSearchResultFor('JW',
      is([]));
  assertThatSearchResultFor('j',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
          javaIoPackage, javaLangPackage, javaIoCloseableClass,
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('J',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass,
          javaIoPackage, javaLangPackage, javaIoCloseableClass,
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('Object',
      is([javaLangObjectClass, orgOmgCorbaObjectClass]));
  assertThatSearchResultFor('O',
      is([javaLangObjectClass, orgOmgCorbaObjectClass,
        testOuterAppleBananaClass]));
  assertThatSearchResultFor('java.lang.Object',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('JLO',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('JAVA.LANG.OBJECT',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('java.lang',
      is([javaLangPackage, javaLangObjectClass]));
  assertThatSearchResultFor('java.lang.',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('java.*.o*e',
      is([javaLangObjectClass]));
  assertThatSearchResultFor('java.*.*o*e',
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass,
          javaLangObjectClass]));
  assertThatSearchResultFor('java.**.***o**e*',
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass,
          javaLangObjectClass]));
  assertThatSearchResultFor('javax.swing.border.A',
      is([javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('PoiDD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PoiDD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('JAGPD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.P2DD',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('hudson.Hudson',
      is([]));
  assertThatSearchResultFor('Double',
      is([javaAwtGeomPoint2DDoubleClass]));
  assertThatSearchResultFor('java.awt.geom.Double',
      is([]));
  assertThatSearchResultFor('Apple',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Apple',
      is([]));
  assertThatSearchResultFor('Apple.Banana',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Apple.Banana',
      is([]));
  assertThatSearchResultFor('AB',
      is([javaxSwingBorderAbstractBorderClass, testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.AB',
      is([]));
  assertThatSearchResultFor('Banana',
      is([testOuterAppleBananaClass]));
  assertThatSearchResultFor('test.Banana',
      is([]));
  assertThatSearchResultFor('Ja.Aw.',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass]));
});


UnitTestSuite.testFunctionFor('RegexLibrary._getRegex', function() {
  assertThat('removal of excess asterisk characters',
      RegexLibrary._getRegex('java.**.***o**e*').pattern, is(
      RegexLibrary._getRegex('java.*.*o*e').pattern));
});


UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getTopLink',
    function() {
      var linkOne = new ClassLink(LinkType.CLASS, 'java.awt', 'Component');
      var linkTwo = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
      var getTopLink = Search._PackagesAndClasses._getTopLink;

      assertThat('no links, best match undefined', getTopLink([]), is(null));
      assertThat('one link, best match undefined',
          getTopLink([linkOne]), is(linkOne));
      assertThat('two links, best match undefined',
          getTopLink([linkOne, linkTwo]), is(linkOne));
      assertThat('no links, best match defined',
          getTopLink([], linkOne), is(linkOne));
      assertThat('one link, best match defined',
          getTopLink([linkOne], linkTwo), is(linkTwo));
    });


UnitTestSuite.testFunctionFor('Search._PackagesAndClasses._getBestMatch',
    function() {
      var hudsonPackage = new PackageLink('hudson');
      var javaIoPackage = new PackageLink('java.io');
      var javaLangPackage = new PackageLink('java.lang');
      var javaUtilListClass = new ClassLink(LinkType.INTERFACE,
          'java.util', 'List');
      var hudsonModelHudsonClass = new ClassLink(LinkType.CLASS,
          'hudson.model', 'Hudson');
      var javaAwtListClass = new ClassLink(LinkType.CLASS,
          'java.awt', 'List');
      var javaIoCloseableClass = new ClassLink(LinkType.CLASS,
          'java.io', 'Closeable');
      var javaLangObjectClass = new ClassLink(LinkType.CLASS,
          'java.lang', 'Object');
      var javaxSwingBorderFactoryClass = new ClassLink(LinkType.CLASS,
          'javax.swing', 'BorderFactory');
      var javaxSwingBorderAbstractBorderClass = new ClassLink(LinkType.CLASS,
          'javax.swing.border', 'AbstractBorder');
      var orgOmgCorbaObjectClass = new ClassLink(LinkType.CLASS,
          'org.omg.CORBA', 'Object');

      var allLinks = [hudsonPackage, javaIoPackage, javaLangPackage,
        javaUtilListClass, hudsonModelHudsonClass, javaAwtListClass,
        javaIoCloseableClass, javaLangObjectClass, javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass, orgOmgCorbaObjectClass];

      var assertThatBestMatchFor = function(searchString, searchResult) {
        assertThat(UnitTestSuite.quote(searchString),
            Search._PackagesAndClasses._getBestMatch(searchString, allLinks),
            is(searchResult));
      };

      assertThatBestMatchFor('java.io', is(javaIoPackage));
      assertThatBestMatchFor('j', is(null));
      assertThatBestMatchFor('J', is(null));
      assertThatBestMatchFor('Object', is(javaLangObjectClass));
      assertThatBestMatchFor('O', is(null));
      assertThatBestMatchFor('java.lang.Object', is(javaLangObjectClass));
      assertThatBestMatchFor('JAVA.LANG.OBJECT', is(javaLangObjectClass));
      assertThatBestMatchFor('org.omg.CORBA.Object', is(
          orgOmgCorbaObjectClass));
      assertThatBestMatchFor('java.lang', is(javaLangPackage));
      assertThatBestMatchFor('java.lang.', is(null));
      assertThatBestMatchFor('java.*.o*e', is(null));
      assertThatBestMatchFor('java.*.*o*e', is(null));
      assertThatBestMatchFor('javax.swing.border.A', is(null));
      assertThatBestMatchFor('hudson', is(hudsonPackage));
      assertThatBestMatchFor('Hudson', is(hudsonModelHudsonClass));
      assertThatBestMatchFor('list', is(javaUtilListClass));
    });


UnitTestSuite.testFunctionFor('getPackageLinks', function() {

  var classLinks = [
    new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder'),
    new ClassLink(LinkType.CLASS, 'java.awt', 'Button'),
    new ClassLink(LinkType.CLASS, 'javax.swing', 'SwingWorker')
  ];

  var expectedPackageLinks = [
    new PackageLink('java.awt'),
    new PackageLink('javax.swing'),
    new PackageLink('javax.swing.border')
  ];

  assertThat('', getPackageLinks(classLinks), is(expectedPackageLinks));
});


UnitTestSuite.testFunctionFor('getClassLinks', function() {

  function assert(args, html, description) {
    var link = new ClassLink(args.type, args.package, args.class);
    assertThat(description, getClassLinks(html), is([link]));
  }

  function runClassesHtmlTestCase(args, includeTitle) {
    if (!args.typeInTitle) {
      args.typeInTitle = args.type;
    }

    var descriptionPrefix = args.type + ' ' +
        (includeTitle ? 'with title' : 'without title') + ',' +
        (args.italic ? 'with italic tag' : 'without italic tag') + ': ';

    var lowerCaseHtml =
        '<a href="' + args.href + '"' +
        (includeTitle ?
            ' title="' + args.typeInTitle + ' in ' + args.package : '') +
        '" target="classFrame">' +
        (args.italic ? '<i>' + args.class + '</i>' : args.class) +
        '</a>';
    assert(args, lowerCaseHtml, descriptionPrefix + 'lowercase html tags');

    var upperCaseHtml =
        '<A HREF="' + args.href + '"' +
        (includeTitle ?
            ' TITLE="' + args.typeInTitle + ' IN ' + args.package : '') +
        '" TARGET="classFrame">' +
        (args.italic ? '<I>' + args.class + '</I>' : args.class) +
        '</A>';
    assert(args, upperCaseHtml, descriptionPrefix + 'uppercase html tags');

    var lowerCaseWithWhitespaceHtml =
        '<a   href  =   "' + args.href + '"' +
        (includeTitle ? '   title  =  "  ' + args.typeInTitle + '   in   ' +
            args.package : '') +
        '  "   target  =  "classFrame"  >  ' +
        (args.italic ? '<i  >  ' + args.class + '  </i  >' : args.class) +
        '   </a  >';
    assert(args, lowerCaseWithWhitespaceHtml, descriptionPrefix +
        'lowercase html tags with additonal whitespace');

    var upperCaseWithWhitespaceHtml =
        '<A   HREF  =  "' + args.href + '"' +
        (includeTitle ? '   TITLE="' + args.typeInTitle +
            '   in   ' + args.package : '') +
        '   "   TARGET  =  "classFrame"  >  ' +
        (args.italic ? '<I  >  ' + args.class + '  </I  >' : args.class) +
        '   </A  >';
    assert(args, upperCaseWithWhitespaceHtml, descriptionPrefix +
        'uppercase html tags with additional whitespace');
  }

  function runTitleTestCase(args) {
    runClassesHtmlTestCase(args, true);
  }

  function runTitleAndNoTitleTestCase(args) {
    runClassesHtmlTestCase(args, true);
    runClassesHtmlTestCase(args, false);
  }

  // Assert that classes are matched correctly. Classes can be matched with or
  // without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'javax/swing/AbstractAction.html', type: LinkType.CLASS,
    package: 'javax.swing', class: 'AbstractAction', italic: false});

  // Assert that interfaces are matched correctly. Interfaces can be matched
  // with or without a title attribute. If an anchor has no title attribute,
  // the contents of the anchor must in italics to be recognised as an
  // interface.
  runTitleAndNoTitleTestCase({
    href: 'javax/swing/text/AbstractDocument.AttributeContext.html',
    type: LinkType.INTERFACE,
    package: 'javax.swing.text', class: 'AbstractDocument.AttributeContext',
    italic: true});
  runTitleTestCase({
    href: 'javax/swing/text/AbstractDocument.AttributeContext.html',
    type: LinkType.INTERFACE,
    package: 'javax.swing.text', class: 'AbstractDocument.AttributeContext',
    italic: false});

  // Assert that enumerations are matched correctly. Anchors must have a title
  // attribute to be recognised as an enumeration.
  runTitleTestCase({
    href: 'java/net/Authenticator.RequestorType.html', type: LinkType.ENUM,
    package: 'java.net', class: 'Authenticator.RequestorType',
    italic: false});

  // Assert that exceptions are matched correctly. Exceptions can be matched
  // with or without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'java/security/AccessControlException.html',
    type: LinkType.EXCEPTION, typeInTitle: 'class',
    package: 'java.security', class: 'AccessControlException',
    italic: false});

  // Assert that errors are matched correctly. Errors can be matched with or
  // without a title attribute.
  runTitleAndNoTitleTestCase({
    href: 'java/lang/AbstractMethodError.html',
    type: LinkType.ERROR, typeInTitle: 'class',
    package: 'java.lang', class: 'AbstractMethodError', italic: false});

  // Assert that annotations are matched correctly. Anchors must have a title
  // attribute to be recognised as an annotation.
  runTitleTestCase({
    href: 'javax/xml/ws/Action.html', type: LinkType.ANNOTATION,
    package: 'javax.xml.ws', class: 'Action', italic: false});
});


UnitTestSuite.testFunctionFor('endsWith', function() {

  var quote = UnitTestSuite.quote;

  var assertThatEndsWith = function(stringOne, stringTwo, expectedResult) {
    assertThat(quote(stringOne) + ' ends with ' + quote(stringTwo) + ':',
        endsWith(stringOne, stringTwo),
        expectedResult);
  };

  assertThatEndsWith(undefined, '', is(false));
  assertThatEndsWith(null, '', is(false));
  assertThatEndsWith('one', 'onetwo', is(false));
  assertThatEndsWith('one', 'one', is(true));
  assertThatEndsWith('one', 'e', is(true));
  assertThatEndsWith('', 'two', is(false));
});


UnitTestSuite.testFunctionFor('trimFromStart', function() {

  var assertThatTrimFromStart = function(stringToTrim, expectedResult) {
    assertThat(UnitTestSuite.quote(stringToTrim), trimFromStart(stringToTrim),
        expectedResult);
  };

  assertThatTrimFromStart('string', is('string'));
  assertThatTrimFromStart('string   ', is('string   '));
  assertThatTrimFromStart('   string', is('string'));
  assertThatTrimFromStart('   string   ', is('string   '));
});


UnitTestSuite.testFunctionFor('trimFromEnd', function() {

  var assertThatTrimFromEnd = function(stringToTrim, expectedResult) {
    assertThat(UnitTestSuite.quote(stringToTrim), trimFromEnd(stringToTrim),
        expectedResult);
  };

  assertThatTrimFromEnd('string', is('string'));
  assertThatTrimFromEnd('string   ', is('string'));
  assertThatTrimFromEnd('   string', is('   string'));
  assertThatTrimFromEnd('   string   ', is('   string'));
});


UnitTestSuite.testFunctionFor('splitOnFirst', function() {

  var quote = UnitTestSuite.quote;

  var assertThatSplitOnFirst = function(
      stringToSplit, separator, expectedResult) {
    assertThat(
        'split ' + quote(stringToSplit) + ' on first ' + quote(separator),
        splitOnFirst(stringToSplit, separator),
        expectedResult);
  };

  assertThatSplitOnFirst(' one ', ',', is([' one ', '']));
  assertThatSplitOnFirst(' one , two ', ',', is([' one', 'two ']));
  assertThatSplitOnFirst(' one , two , three ', ',', is(
      [' one', 'two , three ']));
  assertThatSplitOnFirst('one,two,three', ',', is(['one', 'two,three']));
  assertThatSplitOnFirst('one->two->three', '->', is(['one', 'two->three']));
});


// Run the tests
var unitTestResult = UnitTestSuite.run();
document.write(new Date() + "<p>");
document.write(unitTestResult);

