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
  assertThatSearchResultFor('j.i',
      is([javaIoPackage, javaIoCloseableClass]));
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
  assertThatSearchResultFor('j.l.O',
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
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
  assertThatSearchResultFor('java.**.***o**e*',
      is([javaAwtGeomPoint2DDoubleClass, javaIoCloseableClass,
          javaLangObjectClass, javaxSwingBorderFactoryClass,
          javaxSwingBorderAbstractBorderClass]));
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
  assertThatSearchResultFor('j.a.g.PD',
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
  assertThatSearchResultFor('ja.aw.',
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
      var javaIoCloseable = new ClassLink(LinkType.INTERFACE,
          'java.io', 'Closeable');
      var orgOmgCorbaDataInputStream = new ClassLink(LinkType.INTERFACE,
          'org.omg.CORBA', 'DataInputStream');
      var javaUtilList = new ClassLink(LinkType.INTERFACE,
          'java.util', 'List');
      var orgOmgCorbaObject = new ClassLink(LinkType.INTERFACE,
          'org.omg.CORBA', 'Object');
      var javaxSwingBorderAbstractBorder = new ClassLink(LinkType.CLASS,
          'javax.swing.border', 'AbstractBorder');
      var javaxSwingBorderFactory = new ClassLink(LinkType.CLASS,
          'javax.swing', 'BorderFactory');
      var javaIoDataInputStream = new ClassLink(LinkType.CLASS,
          'java.io', 'DataInputStream');
      var javaxPrintDocFlavorReader = new ClassLink(LinkType.CLASS,
          'javax.print', 'DocFlavor.READER');
      var hudsonModelHudson = new ClassLink(LinkType.CLASS,
          'hudson.model', 'Hudson');
      var javaAwtList = new ClassLink(LinkType.CLASS,
          'java.awt', 'List');
      var javaLangObject = new ClassLink(LinkType.CLASS,
          'java.lang', 'Object');
      var javaIoReader = new ClassLink(LinkType.CLASS,
          'java.io', 'Reader');

      var allLinks = [
        hudsonPackage, javaIoPackage, javaLangPackage, javaIoCloseable,
        orgOmgCorbaDataInputStream, javaUtilList, orgOmgCorbaObject,
        javaxSwingBorderAbstractBorder, javaxSwingBorderFactory,
        javaIoDataInputStream, javaxPrintDocFlavorReader, hudsonModelHudson,
        javaAwtList, javaLangObject, javaIoReader
      ];

      var assertThatBestMatchFor = function(searchString, searchResult) {
        var condition = RegexLibrary.createCondition(searchString);
        var links = allLinks.filter(condition);
        assertThat(UnitTestSuite.quote(searchString),
            Search._PackagesAndClasses._getBestMatch(searchString, links),
            is(searchResult));
      };

      assertThatBestMatchFor('java.io', is(javaIoPackage));
      assertThatBestMatchFor('j', is(null));
      assertThatBestMatchFor('J', is(null));
      assertThatBestMatchFor('Object', is(javaLangObject));
      assertThatBestMatchFor('O', is(null));
      assertThatBestMatchFor('java.lang.Object', is(null));
      assertThatBestMatchFor('JAVA.LANG.OBJECT', is(null));
      assertThatBestMatchFor('org.omg.CORBA.Object', is(null));
      assertThatBestMatchFor('java.lang', is(javaLangPackage));
      assertThatBestMatchFor('java.lang.', is(null));
      assertThatBestMatchFor('java.*.o*e', is(null));
      assertThatBestMatchFor('java.*.*o*e', is(null));
      assertThatBestMatchFor('javax.swing.border.A', is(null));
      assertThatBestMatchFor('hudson', is(hudsonPackage));
      assertThatBestMatchFor('Hudson', is(hudsonModelHudson));
      assertThatBestMatchFor('list', is(javaUtilList));
      assertThatBestMatchFor('Reader', is(javaIoReader));
      assertThatBestMatchFor('DataInputStream', is(javaIoDataInputStream));
    });


UnitTestSuite.testFunctionFor('Search._ClassMembersAndKeywords._createLink',
    function() {
      var baseUrl = 'baseUrl';

      var assertThatMemberLinkFor = function(anchorName, expectedDisplayName) {
        assertThat(UnitTestSuite.quote(anchorName),
            Search._ClassMembersAndKeywords._createLink(baseUrl, anchorName),
            is(new MemberLink(baseUrl, anchorName, expectedDisplayName)));
      };
      var assertThatKeywordLinkFor = function(anchorName, expectedDisplayName) {
        var expectedLink = (expectedDisplayName === null ? null :
            new KeywordLink(baseUrl, anchorName, expectedDisplayName));
        assertThat(UnitTestSuite.quote(anchorName),
            Search._ClassMembersAndKeywords._createLink(baseUrl, anchorName),
            is(expectedLink));
      };

      // Javadoc generated by Java 7 or earlier
      assertThatMemberLinkFor('toString()', is('toString()'));
      assertThatMemberLinkFor('wait(long)', is('wait(long)'));
      assertThatMemberLinkFor('wait(long, int)', is('wait(long, int)'));
      assertThatKeywordLinkFor('navbar_top', is(null));
      assertThatKeywordLinkFor('navbar_top_firstrow', is(null));
      assertThatKeywordLinkFor('skip-navbar_top', is(null));
      assertThatKeywordLinkFor(
          'constructor_summary',
          is('constructor summary'));
      assertThatKeywordLinkFor(
          'nested_class_summary',
          is('nested class summary')),
      assertThatKeywordLinkFor(
          'methods_inherited_from_class_java.awt.Window',
          is('methods inherited from class java.awt.Window'));
      assertThatKeywordLinkFor(
          'fields_inherited_from_class_java.awt.Component',
          is('fields inherited from class java.awt.Component'));
      assertThatKeywordLinkFor(
          'nested_classes_inherited_from_class_java.awt.Window',
          is('nested classes inherited from class java.awt.Window'));

      // Javadoc generated by Java 8
      assertThatMemberLinkFor('toString--', is('toString()'));
      assertThatMemberLinkFor('wait-long-', is('wait(long)'));
      assertThatMemberLinkFor('wait-long-int-', is('wait(long, int)'));
      assertThatKeywordLinkFor('navbar.top', is(null));
      assertThatKeywordLinkFor('navbar.top.firstrow', is(null));
      assertThatKeywordLinkFor('skip.navbar.top', is(null));
      assertThatKeywordLinkFor(
          'constructor.summary',
          is('constructor summary'));
      assertThatKeywordLinkFor(
          'nested.class.summary',
          is('nested class summary')),
      assertThatKeywordLinkFor(
          'methods.inherited.from.class.java.awt.Window',
          is('methods inherited from class java.awt.Window'));
      assertThatKeywordLinkFor(
          'fields.inherited.from.class.java.awt.Component',
          is('fields inherited from class java.awt.Component'));
      assertThatKeywordLinkFor(
          'nested.classes.inherited.from.class.java.awt.Window',
          is('nested classes inherited from class java.awt.Window'));
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

  //
  // Modern Javadoc syntax (with title attribute)
  //

  var html = '';
  var links = [];

  // Interface
  html += '<a href="' +
          'javax/swing/text/AbstractDocument.AttributeContext.html" ' +
          'title="interface in javax.swing.text" target="classFrame">' +
          '<i>AbstractDocument.AttributeContext</i></a>';
  links.push(new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext'));
  html += '  <A  HREF  =  "java/lang/Appendable.html"  ' +
          'TITLE  =  "  INTERFACE  IN  java.lang  "   ' +
          'TARGET  =  "classFrame"  >  Appendable  </a  >  ';
  links.push(new ClassLink(LinkType.INTERFACE, 'java.lang', 'Appendable'));

  // Interface (Java 8 syntax)
  html += '<a href="java/util/concurrent/Callable.html" ' +
          'title="interface in java.util.concurrent" target="classFrame">' +
          '<span class="interfaceName">Callable</span></a>';
  links.push(new ClassLink(LinkType.INTERFACE, 'java.util.concurrent',
      'Callable'));
  html += '  <A  HREF  =  "java/sql/CallableStatement.html"  ' +
          'TITLE  =  "  INTERFACE  IN  java.sql  "  ' +
          'TARGET  =  "  classFrame  "  >  ' +
          '<SPAN  CLASS  =  "  interfaceName"  >  ' +
          'CallableStatement  </span  >  </a  >';
  links.push(new ClassLink(LinkType.INTERFACE, 'java.sql',
      'CallableStatement'));

  // Class
  html += '<a href="javax/swing/AbstractAction.html" ' +
          'title="class in javax.swing" target="classFrame">' +
          'AbstractAction</a>';
  links.push(new ClassLink(LinkType.CLASS, 'javax.swing', 'AbstractAction'));
  html += '  <A  HREF  =  "java/lang/Object.html"  ' +
          'TITLE  =  "  CLASS  IN  java.lang  "   ' +
          'TARGET  =  "classFrame"  >  Object  </a  >  ';
  links.push(new ClassLink(LinkType.CLASS, 'java.lang', 'Object'));

  // Enum
  html += '<a href="' +
          'java/net/Authenticator.RequestorType.html" ' +
          'title="enum in java.net" target="classFrame">' +
          'Authenticator.RequestorType</a>';
  links.push(new ClassLink(LinkType.ENUM, 'java.net',
      'Authenticator.RequestorType'));

  // Exception
  html += '<a href="java/security/AccessControlException.html" ' +
          'title="class in java.security" target="classFrame">' +
          'AccessControlException</a>';
  links.push(new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException'));

  // Error
  html += '<a href="java/lang/AbstractMethodError.html" ' +
          'title="class in java.lang" target="classFrame">' +
          'AbstractMethodError</a>';
  links.push(new ClassLink(LinkType.ERROR, 'java.lang',
      'AbstractMethodError'));

  // Annotation
  html += '<a href="' +
          'javax/xml/ws/Action.html" ' +
          'title="annotation in javax.xml.ws" target="classFrame">' +
          'Action</a>';
  links.push(new ClassLink(LinkType.ANNOTATION, 'javax.xml.ws', 'Action'));

  assertThat('modern javadoc syntax', getClassLinks(html), is(links));

  //
  // Javadoc generated by Java 1.2 or 1.3 (without title attribute)
  // e.g. http://www.cise.ufl.edu/~dgoldste/oop/oop-javadoc/
  //

  html = '';
  links = [];

  // Interface (has italics)
  html += '<a href="' +
          'javax/swing/text/AbstractDocument.AttributeContext.html" ' +
          'target="classFrame"><i>AbstractDocument.AttributeContext</i></a>';
  links.push(new ClassLink(LinkType.INTERFACE, 'javax.swing.text',
      'AbstractDocument.AttributeContext'));
  html += '  <A  HREF  =  "java/lang/Appendable.html"  ' +
          'TARGET  =  "classFrame"  >  <i  >  Appendable  </i  >  </a  >  ';
  links.push(new ClassLink(LinkType.INTERFACE, 'java.lang', 'Appendable'));

  // Class (no italics)
  html += '<a href="javax/swing/AbstractAction.html" target="classFrame">' +
          'AbstractAction</a>';
  links.push(new ClassLink(LinkType.CLASS, 'javax.swing', 'AbstractAction'));
  html += '  <A  HREF  =  "java/lang/Object.html"  ' +
          'TARGET  =  "classFrame"  >  Object  </a  >  ';
  links.push(new ClassLink(LinkType.CLASS, 'java.lang', 'Object'));

  // Exception (no italics)
  html += '<a href="java/security/AccessControlException.html" ' +
          'target="classFrame">AccessControlException</a>';
  links.push(new ClassLink(LinkType.EXCEPTION, 'java.security',
      'AccessControlException'));

  // Error (no italics)
  html += '<a href="java/lang/AbstractMethodError.html" ' +
          'target="classFrame">AbstractMethodError</a>';
  links.push(new ClassLink(LinkType.ERROR, 'java.lang',
      'AbstractMethodError'));

  assertThat('Java 1.2 or 1.3 syntax', getClassLinks(html), is(links));
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
document.write(new Date() + '<p>');
document.write(unitTestResult);

