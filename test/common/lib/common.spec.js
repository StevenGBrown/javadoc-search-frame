import { describe, expect, test } from 'vitest';

import { loadScripts } from '../../load-scripts';

const context = loadScripts(
  ['src/common/lib/HttpRequest.js', 'src/common/lib/common.js'],
  { location: { href: '' } }
);

function is(value) {
  return value;
}

function quote(str) {
  return [null, undefined].includes(str) ? str : `"${str}"`;
}

describe('common.js', () => {
  describe('extractUrl', () => {
    const { extractUrl } = context;

    var mockLink = {};
    mockLink.getHtml = () => {
      return '<A HREF="urlOfLink"';
    };

    test('', () => {
      expect(extractUrl(mockLink)).toEqual('urlOfLink');
    });
  });

  describe('toAbsoluteUrl', () => {
    const { toAbsoluteUrl } = context;

    var api = 'http://java.sun.com/javase/6/docs/api/';

    test('relative to "all classes" url', () => {
      expect(
        toAbsoluteUrl(
          'java/applet/AppletContext.html',
          api + 'allclasses-frame.html'
        )
      ).toEqual(api + 'java/applet/AppletContext.html');
    });

    test('relative to package url', () => {
      expect(
        toAbsoluteUrl(
          'java/applet/AppletContext.html',
          api + 'java/applet/package-frame.html'
        )
      ).toEqual(api + 'java/applet/AppletContext.html');
    });

    test('already an absolute url', () => {
      expect(
        toAbsoluteUrl(
          api + 'java/applet/AppletContext.html',
          api + 'allclasses-frame.html'
        )
      ).toEqual(api + 'java/applet/AppletContext.html');
    });
  });

  describe('PackageLink.getHtml', () => {
    const { PackageLink } = context;

    test('', () => {
      expect(new PackageLink('java.applet').getHtml()).toEqual(
        '<A HREF="java/applet/package-summary.html" target="classFrame">java.applet</A>'
      );
    });
  });

  describe('PackageLink.getUrl', () => {
    const { PackageLink, toAbsoluteUrl } = context;

    test('', () => {
      expect(new PackageLink('java.applet').getUrl()).toEqual(
        toAbsoluteUrl('java/applet/package-summary.html')
      );
    });
  });

  describe('ClassLink.getHtml', () => {
    const { ClassLink, LinkType, toAbsoluteUrl } = context;

    test('interface', () => {
      expect(
        new ClassLink(
          LinkType.INTERFACE,
          'javax.swing.text',
          'AbstractDocument.AttributeContext'
        ).getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl(
            'javax/swing/text/AbstractDocument.AttributeContext.html'
          ) +
          '" title="interface in javax.swing.text" target="classFrame"><I>' +
          'AbstractDocument.AttributeContext</I></A>&nbsp;[&nbsp;' +
          'javax.swing.text&nbsp;]'
      );
    });

    test('class', () => {
      expect(
        new ClassLink(
          LinkType.CLASS,
          'javax.lang.model.util',
          'AbstractAnnotationValueVisitor6'
        ).getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl(
            'javax/lang/model/util/AbstractAnnotationValueVisitor6.html'
          ) +
          '" title="class in javax.lang.model.util" target="classFrame">' +
          'AbstractAnnotationValueVisitor6</A>&nbsp;[&nbsp;javax.lang.model.util' +
          '&nbsp;]'
      );
    });

    test('enum', () => {
      expect(
        new ClassLink(LinkType.ENUM, 'java.lang', 'Thread.State').getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl('java/lang/Thread.State.html') +
          '" title="enum in java.lang" ' +
          'target="classFrame">Thread.State</A>&nbsp;[&nbsp;java.lang&nbsp;]'
      );
    });

    test('exception', () => {
      expect(
        new ClassLink(
          LinkType.EXCEPTION,
          'java.security',
          'AccessControlException'
        ).getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl('java/security/AccessControlException.html') +
          '" title="class in java.security" target="classFrame">' +
          'AccessControlException</A>&nbsp;[&nbsp;java.security&nbsp;]'
      );
    });

    test('error', () => {
      expect(
        new ClassLink(
          LinkType.ERROR,
          'java.lang.annotation',
          'AnnotationFormatError'
        ).getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl('java/lang/annotation/AnnotationFormatError.html') +
          '" title="class in java.lang.annotation" target="classFrame">' +
          'AnnotationFormatError</A>&nbsp;[&nbsp;java.lang.annotation&nbsp;]'
      );
    });

    test('annotation', () => {
      expect(
        new ClassLink(LinkType.ANNOTATION, 'java.lang', 'Deprecated').getHtml()
      ).toEqual(
        '<A HREF="' +
          toAbsoluteUrl('java/lang/Deprecated.html') +
          '" title="annotation in java.lang" ' +
          'target="classFrame">Deprecated</A>&nbsp;[&nbsp;java.lang&nbsp;]'
      );
    });
  });

  describe('ClassLink.getUrl', () => {
    const { ClassLink, LinkType, toAbsoluteUrl } = context;

    test('interface', () => {
      expect(
        new ClassLink(
          LinkType.INTERFACE,
          'javax.swing.text',
          'AbstractDocument.AttributeContext'
        ).getUrl()
      ).toEqual(
        toAbsoluteUrl('javax/swing/text/AbstractDocument.AttributeContext.html')
      );
    });

    test('class', () => {
      expect(
        new ClassLink(
          LinkType.CLASS,
          'javax.lang.model.util',
          'AbstractAnnotationValueVisitor6'
        ).getUrl()
      ).toEqual(
        toAbsoluteUrl(
          'javax/lang/model/util/AbstractAnnotationValueVisitor6.html'
        )
      );
    });

    test('enum', () => {
      expect(
        new ClassLink(LinkType.ENUM, 'java.lang', 'Thread.State').getUrl()
      ).toEqual(toAbsoluteUrl('java/lang/Thread.State.html'));
    });

    test('exception', () => {
      expect(
        new ClassLink(
          LinkType.EXCEPTION,
          'java.security',
          'AccessControlException'
        ).getUrl()
      ).toEqual(toAbsoluteUrl('java/security/AccessControlException.html'));
    });

    test('error', () => {
      expect(
        new ClassLink(
          LinkType.ERROR,
          'java.lang.annotation',
          'AnnotationFormatError'
        ).getUrl()
      ).toEqual(
        toAbsoluteUrl('java/lang/annotation/AnnotationFormatError.html')
      );
    });

    test('annotation', () => {
      expect(
        new ClassLink(LinkType.ANNOTATION, 'java.lang', 'Deprecated').getUrl()
      ).toEqual(toAbsoluteUrl('java/lang/Deprecated.html'));
    });
  });

  describe('RegexLibrary.createCondition', () => {
    const { ClassLink, LinkType, PackageLink, RegexLibrary } = context;

    var javaAwtGeomPoint2DClass = new ClassLink(
      LinkType.CLASS,
      'java.awt.geom',
      'Point2D'
    );
    var javaAwtGeomPoint2DDoubleClass = new ClassLink(
      LinkType.CLASS,
      'java.awt.geom',
      'Point2D.Double'
    );
    var javaIoPackage = new PackageLink('java.io');
    var javaLangPackage = new PackageLink('java.lang');
    var javaIoCloseableClass = new ClassLink(
      LinkType.CLASS,
      'java.io',
      'Closeable'
    );
    var javaLangObjectClass = new ClassLink(
      LinkType.CLASS,
      'java.lang',
      'Object'
    );
    var javaxSwingBorderFactoryClass = new ClassLink(
      LinkType.CLASS,
      'javax.swing',
      'BorderFactory'
    );
    var javaxSwingBorderAbstractBorderClass = new ClassLink(
      LinkType.CLASS,
      'javax.swing.border',
      'AbstractBorder'
    );
    var orgOmgCorbaObjectClass = new ClassLink(
      LinkType.CLASS,
      'org.omg.CORBA',
      'Object'
    );
    var hudsonPackage = new PackageLink('hudson');
    var hudsonModelHudsonClass = new ClassLink(
      LinkType.CLASS,
      'hudson.model',
      'Hudson'
    );
    var testOuterAppleBananaClass = new ClassLink(
      LinkType.CLASS,
      'test',
      'Outer.Apple.Banana'
    );

    var allLinks = [
      javaAwtGeomPoint2DClass,
      javaAwtGeomPoint2DDoubleClass,
      javaIoPackage,
      javaLangPackage,
      javaIoCloseableClass,
      javaLangObjectClass,
      javaxSwingBorderFactoryClass,
      javaxSwingBorderAbstractBorderClass,
      orgOmgCorbaObjectClass,
      hudsonPackage,
      hudsonModelHudsonClass,
      testOuterAppleBananaClass,
    ];

    function assertThatSearchResultFor(searchString, searchResult) {
      test(searchString, () => {
        expect(
          allLinks.filter(RegexLibrary.createCondition(searchString))
        ).toEqual(searchResult);
      });
    }

    assertThatSearchResultFor(
      'java.io',
      is([javaIoPackage, javaIoCloseableClass])
    );
    assertThatSearchResultFor('j.i', is([javaIoPackage, javaIoCloseableClass]));
    assertThatSearchResultFor(
      'j',
      is([
        javaAwtGeomPoint2DClass,
        javaAwtGeomPoint2DDoubleClass,
        javaIoPackage,
        javaLangPackage,
        javaIoCloseableClass,
        javaLangObjectClass,
        javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass,
      ])
    );
    assertThatSearchResultFor(
      'J',
      is([
        javaAwtGeomPoint2DClass,
        javaAwtGeomPoint2DDoubleClass,
        javaIoPackage,
        javaLangPackage,
        javaIoCloseableClass,
        javaLangObjectClass,
        javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass,
      ])
    );
    assertThatSearchResultFor(
      'Object',
      is([javaLangObjectClass, orgOmgCorbaObjectClass])
    );
    assertThatSearchResultFor(
      'O',
      is([
        javaLangObjectClass,
        orgOmgCorbaObjectClass,
        testOuterAppleBananaClass,
      ])
    );
    assertThatSearchResultFor('java.lang.Object', is([javaLangObjectClass]));
    assertThatSearchResultFor('j.l.O', is([javaLangObjectClass]));
    assertThatSearchResultFor('JAVA.LANG.OBJECT', is([javaLangObjectClass]));
    assertThatSearchResultFor(
      'java.lang',
      is([javaLangPackage, javaLangObjectClass])
    );
    assertThatSearchResultFor('java.lang.', is([javaLangObjectClass]));
    assertThatSearchResultFor('java.*.o*e', is([javaLangObjectClass]));
    assertThatSearchResultFor(
      'java.*.*o*e',
      is([
        javaAwtGeomPoint2DDoubleClass,
        javaIoCloseableClass,
        javaLangObjectClass,
        javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass,
      ])
    );
    assertThatSearchResultFor(
      'java.**.***o**e*',
      is([
        javaAwtGeomPoint2DDoubleClass,
        javaIoCloseableClass,
        javaLangObjectClass,
        javaxSwingBorderFactoryClass,
        javaxSwingBorderAbstractBorderClass,
      ])
    );
    assertThatSearchResultFor(
      'javax.swing.border.A',
      is([javaxSwingBorderAbstractBorderClass])
    );
    assertThatSearchResultFor(
      'PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor('PoiDD', is([javaAwtGeomPoint2DDoubleClass]));
    assertThatSearchResultFor(
      'java.awt.geom.PoiD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'java.awt.geom.PoiDD',
      is([javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor('P2DD', is([javaAwtGeomPoint2DDoubleClass]));
    assertThatSearchResultFor(
      'java.awt.geom.PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'j.a.g.PD',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'java.awt.geom.P2D',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor(
      'java.awt.geom.P2DD',
      is([javaAwtGeomPoint2DDoubleClass])
    );
    assertThatSearchResultFor('hudson.Hudson', is([]));
    assertThatSearchResultFor('Double', is([javaAwtGeomPoint2DDoubleClass]));
    assertThatSearchResultFor('java.awt.geom.Double', is([]));
    assertThatSearchResultFor('Apple', is([testOuterAppleBananaClass]));
    assertThatSearchResultFor('test.Apple', is([]));
    assertThatSearchResultFor('Apple.Banana', is([testOuterAppleBananaClass]));
    assertThatSearchResultFor('test.Apple.Banana', is([]));
    assertThatSearchResultFor(
      'AB',
      is([javaxSwingBorderAbstractBorderClass, testOuterAppleBananaClass])
    );
    assertThatSearchResultFor('test.AB', is([]));
    assertThatSearchResultFor('Banana', is([testOuterAppleBananaClass]));
    assertThatSearchResultFor('test.Banana', is([]));
    assertThatSearchResultFor(
      'ja.aw.',
      is([javaAwtGeomPoint2DClass, javaAwtGeomPoint2DDoubleClass])
    );
  });

  describe('RegexLibrary._getRegex', () => {
    const { RegexLibrary } = context;

    test('removal of excess asterisk characters', () => {
      expect(RegexLibrary._getRegex('java.**.***o**e*').pattern).toEqual(
        RegexLibrary._getRegex('java.*.*o*e').pattern
      );
    });
  });

  describe('Search._PackagesAndClasses._getTopLink', () => {
    const { ClassLink, LinkType, Search } = context;

    var linkOne = new ClassLink(LinkType.CLASS, 'java.awt', 'Component');
    var linkTwo = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
    var getTopLink = Search._PackagesAndClasses._getTopLink;

    test('no links, best match undefined', () => {
      expect(getTopLink([])).toEqual(null);
    });
    test('one link, best match undefined', () => {
      expect(getTopLink([linkOne])).toEqual(linkOne);
    });
    test('two links, best match undefined', () => {
      expect(getTopLink([linkOne, linkTwo])).toEqual(linkOne);
    });
    test('no links, best match defined', () => {
      expect(getTopLink([], linkOne)).toEqual(linkOne);
    });
    test('one link, best match defined', () => {
      expect(getTopLink([linkOne], linkTwo)).toEqual(linkTwo);
    });
  });

  describe('Search._PackagesAndClasses._getBestMatch', () => {
    const { ClassLink, LinkType, PackageLink, RegexLibrary, Search } = context;

    var hudsonPackage = new PackageLink('hudson');
    var javaIoPackage = new PackageLink('java.io');
    var javaLangPackage = new PackageLink('java.lang');
    var javaIoCloseable = new ClassLink(
      LinkType.INTERFACE,
      'java.io',
      'Closeable'
    );
    var orgOmgCorbaDataInputStream = new ClassLink(
      LinkType.INTERFACE,
      'org.omg.CORBA',
      'DataInputStream'
    );
    var javaUtilList = new ClassLink(LinkType.INTERFACE, 'java.util', 'List');
    var orgOmgCorbaObject = new ClassLink(
      LinkType.INTERFACE,
      'org.omg.CORBA',
      'Object'
    );
    var javaxSwingBorderAbstractBorder = new ClassLink(
      LinkType.CLASS,
      'javax.swing.border',
      'AbstractBorder'
    );
    var javaxSwingBorderFactory = new ClassLink(
      LinkType.CLASS,
      'javax.swing',
      'BorderFactory'
    );
    var javaIoDataInputStream = new ClassLink(
      LinkType.CLASS,
      'java.io',
      'DataInputStream'
    );
    var javaxPrintDocFlavorReader = new ClassLink(
      LinkType.CLASS,
      'javax.print',
      'DocFlavor.READER'
    );
    var hudsonModelHudson = new ClassLink(
      LinkType.CLASS,
      'hudson.model',
      'Hudson'
    );
    var javaAwtList = new ClassLink(LinkType.CLASS, 'java.awt', 'List');
    var javaLangObject = new ClassLink(LinkType.CLASS, 'java.lang', 'Object');
    var javaIoReader = new ClassLink(LinkType.CLASS, 'java.io', 'Reader');

    var allLinks = [
      hudsonPackage,
      javaIoPackage,
      javaLangPackage,
      javaIoCloseable,
      orgOmgCorbaDataInputStream,
      javaUtilList,
      orgOmgCorbaObject,
      javaxSwingBorderAbstractBorder,
      javaxSwingBorderFactory,
      javaIoDataInputStream,
      javaxPrintDocFlavorReader,
      hudsonModelHudson,
      javaAwtList,
      javaLangObject,
      javaIoReader,
    ];

    function assertThatBestMatchFor(searchString, searchResult) {
      test(searchString, () => {
        var condition = RegexLibrary.createCondition(searchString);
        var links = allLinks.filter(condition);
        expect(
          Search._PackagesAndClasses._getBestMatch(searchString, links)
        ).toEqual(searchResult);
      });
    }

    assertThatBestMatchFor('java.io', is(javaIoPackage));
    assertThatBestMatchFor('j', is(null));
    assertThatBestMatchFor('J', is(null));
    assertThatBestMatchFor('Object', is(javaLangObject));
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
    assertThatBestMatchFor('Reade', is(javaIoReader));
    assertThatBestMatchFor('DataInputStream', is(javaIoDataInputStream));
  });

  describe('Search._ClassMembersAndKeywords._createLink', () => {
    const { KeywordLink, MemberLink, Search } = context;

    var baseUrl = 'baseUrl';

    function assertThatMemberLinkFor(anchorName, expectedDisplayName) {
      test(anchorName, () => {
        expect(
          Search._ClassMembersAndKeywords._createLink(baseUrl, anchorName)
        ).toEqual(new MemberLink(baseUrl, anchorName, expectedDisplayName));
      });
    }
    function assertThatKeywordLinkFor(anchorName, expectedDisplayName) {
      test(anchorName, () => {
        var expectedLink =
          expectedDisplayName === null
            ? null
            : new KeywordLink(baseUrl, anchorName, expectedDisplayName);
        expect(
          Search._ClassMembersAndKeywords._createLink(baseUrl, anchorName)
        ).toEqual(expectedLink);
      });
    }

    // Javadoc generated by Java 7 or earlier
    assertThatMemberLinkFor('toString()', is('toString()'));
    assertThatMemberLinkFor('wait(long)', is('wait(long)'));
    assertThatMemberLinkFor('wait(long, int)', is('wait(long, int)'));
    assertThatKeywordLinkFor('navbar_top', is(null));
    assertThatKeywordLinkFor('navbar_top_firstrow', is(null));
    assertThatKeywordLinkFor('skip-navbar_top', is(null));
    assertThatKeywordLinkFor('constructor_summary', is('constructor summary'));
    assertThatKeywordLinkFor(
      'nested_class_summary',
      is('nested class summary')
    ),
      assertThatKeywordLinkFor(
        'methods_inherited_from_class_java.awt.Window',
        is('methods inherited from class java.awt.Window')
      );
    assertThatKeywordLinkFor(
      'fields_inherited_from_class_java.awt.Component',
      is('fields inherited from class java.awt.Component')
    );
    assertThatKeywordLinkFor(
      'nested_classes_inherited_from_class_java.awt.Window',
      is('nested classes inherited from class java.awt.Window')
    );

    // Javadoc generated by Java 8
    assertThatMemberLinkFor('toString--', is('toString()'));
    assertThatMemberLinkFor('wait-long-', is('wait(long)'));
    assertThatMemberLinkFor('wait-long-int-', is('wait(long, int)'));
    assertThatKeywordLinkFor('navbar.top', is(null));
    assertThatKeywordLinkFor('navbar.top.firstrow', is(null));
    assertThatKeywordLinkFor('skip.navbar.top', is(null));
    assertThatKeywordLinkFor('constructor.summary', is('constructor summary'));
    assertThatKeywordLinkFor(
      'nested.class.summary',
      is('nested class summary')
    ),
      assertThatKeywordLinkFor(
        'methods.inherited.from.class.java.awt.Window',
        is('methods inherited from class java.awt.Window')
      );
    assertThatKeywordLinkFor(
      'fields.inherited.from.class.java.awt.Component',
      is('fields inherited from class java.awt.Component')
    );
    assertThatKeywordLinkFor(
      'nested.classes.inherited.from.class.java.awt.Window',
      is('nested classes inherited from class java.awt.Window')
    );
  });

  describe('getPackageLinks', () => {
    const { ClassLink, LinkType, PackageLink, getPackageLinks } = context;

    var classLinks = [
      new ClassLink(LinkType.CLASS, 'javax.swing.border', 'AbstractBorder'),
      new ClassLink(LinkType.CLASS, 'java.awt', 'Button'),
      new ClassLink(LinkType.CLASS, 'javax.swing', 'SwingWorker'),
    ];

    var expectedPackageLinks = [
      new PackageLink('java.awt'),
      new PackageLink('javax.swing'),
      new PackageLink('javax.swing.border'),
    ];

    test('', () => {
      expect(getPackageLinks(classLinks)).toEqual(expectedPackageLinks);
    });
  });

  describe('getClassLinks', () => {
    const { ClassLink, LinkType, getClassLinks } = context;

    //
    // Modern Javadoc syntax (with title attribute)
    //

    var html = '';
    var links = [];

    // Interface
    html +=
      '<a href="' +
      'javax/swing/text/AbstractDocument.AttributeContext.html" ' +
      'title="interface in javax.swing.text" target="classFrame">' +
      '<i>AbstractDocument.AttributeContext</i></a>';
    links.push(
      new ClassLink(
        LinkType.INTERFACE,
        'javax.swing.text',
        'AbstractDocument.AttributeContext'
      )
    );
    html +=
      '  <A  HREF  =  "java/lang/Appendable.html"  ' +
      'TITLE  =  "  INTERFACE  IN  java.lang  "   ' +
      'TARGET  =  "classFrame"  >  Appendable  </a  >  ';
    links.push(new ClassLink(LinkType.INTERFACE, 'java.lang', 'Appendable'));

    // Interface (Java 8 syntax)
    html +=
      '<a href="java/util/concurrent/Callable.html" ' +
      'title="interface in java.util.concurrent" target="classFrame">' +
      '<span class="interfaceName">Callable</span></a>';
    links.push(
      new ClassLink(LinkType.INTERFACE, 'java.util.concurrent', 'Callable')
    );
    html +=
      '  <A  HREF  =  "java/sql/CallableStatement.html"  ' +
      'TITLE  =  "  INTERFACE  IN  java.sql  "  ' +
      'TARGET  =  "  classFrame  "  >  ' +
      '<SPAN  CLASS  =  "  interfaceName"  >  ' +
      'CallableStatement  </span  >  </a  >';
    links.push(
      new ClassLink(LinkType.INTERFACE, 'java.sql', 'CallableStatement')
    );

    // Class
    html +=
      '<a href="javax/swing/AbstractAction.html" ' +
      'title="class in javax.swing" target="classFrame">' +
      'AbstractAction</a>';
    links.push(new ClassLink(LinkType.CLASS, 'javax.swing', 'AbstractAction'));
    html +=
      '  <A  HREF  =  "java/lang/Object.html"  ' +
      'TITLE  =  "  CLASS  IN  java.lang  "   ' +
      'TARGET  =  "classFrame"  >  Object  </a  >  ';
    links.push(new ClassLink(LinkType.CLASS, 'java.lang', 'Object'));

    // Enum
    html +=
      '<a href="' +
      'java/net/Authenticator.RequestorType.html" ' +
      'title="enum in java.net" target="classFrame">' +
      'Authenticator.RequestorType</a>';
    links.push(
      new ClassLink(LinkType.ENUM, 'java.net', 'Authenticator.RequestorType')
    );

    // Exception
    html +=
      '<a href="java/security/AccessControlException.html" ' +
      'title="class in java.security" target="classFrame">' +
      'AccessControlException</a>';
    links.push(
      new ClassLink(
        LinkType.EXCEPTION,
        'java.security',
        'AccessControlException'
      )
    );

    // Error
    html +=
      '<a href="java/lang/AbstractMethodError.html" ' +
      'title="class in java.lang" target="classFrame">' +
      'AbstractMethodError</a>';
    links.push(
      new ClassLink(LinkType.ERROR, 'java.lang', 'AbstractMethodError')
    );

    // Annotation
    html +=
      '<a href="' +
      'javax/xml/ws/Action.html" ' +
      'title="annotation in javax.xml.ws" target="classFrame">' +
      'Action</a>';
    links.push(new ClassLink(LinkType.ANNOTATION, 'javax.xml.ws', 'Action'));

    test('modern javadoc syntax', () => {
      expect(getClassLinks(html)).toEqual(links);
    });

    //
    // Javadoc generated by Java 1.2 or 1.3 (without title attribute)
    // e.g. http://www.cise.ufl.edu/~dgoldste/oop/oop-javadoc/
    //

    html = '';
    links = [];

    // Interface (has italics)
    html +=
      '<a href="' +
      'javax/swing/text/AbstractDocument.AttributeContext.html" ' +
      'target="classFrame"><i>AbstractDocument.AttributeContext</i></a>';
    links.push(
      new ClassLink(
        LinkType.INTERFACE,
        'javax.swing.text',
        'AbstractDocument.AttributeContext'
      )
    );
    html +=
      '  <A  HREF  =  "java/lang/Appendable.html"  ' +
      'TARGET  =  "classFrame"  >  <i  >  Appendable  </i  >  </a  >  ';
    links.push(new ClassLink(LinkType.INTERFACE, 'java.lang', 'Appendable'));

    // Class (no italics)
    html +=
      '<a href="javax/swing/AbstractAction.html" target="classFrame">' +
      'AbstractAction</a>';
    links.push(new ClassLink(LinkType.CLASS, 'javax.swing', 'AbstractAction'));
    html +=
      '  <A  HREF  =  "java/lang/Object.html"  ' +
      'TARGET  =  "classFrame"  >  Object  </a  >  ';
    links.push(new ClassLink(LinkType.CLASS, 'java.lang', 'Object'));

    // Exception (no italics)
    html +=
      '<a href="java/security/AccessControlException.html" ' +
      'target="classFrame">AccessControlException</a>';
    links.push(
      new ClassLink(
        LinkType.EXCEPTION,
        'java.security',
        'AccessControlException'
      )
    );

    // Error (no italics)
    html +=
      '<a href="java/lang/AbstractMethodError.html" ' +
      'target="classFrame">AbstractMethodError</a>';
    links.push(
      new ClassLink(LinkType.ERROR, 'java.lang', 'AbstractMethodError')
    );

    test('Java 1.2 or 1.3 syntax', () => {
      expect(getClassLinks(html)).toEqual(links);
    });
  });

  describe('endsWith', () => {
    const { endsWith } = context;

    function assertThatEndsWith(stringOne, stringTwo, expectedResult) {
      test(`${quote(stringOne)} ends with ${quote(stringTwo)}`, () => {
        expect(endsWith(stringOne, stringTwo)).toEqual(expectedResult);
      });
    }

    assertThatEndsWith(undefined, '', is(false));
    assertThatEndsWith(null, '', is(false));
    assertThatEndsWith('one', 'onetwo', is(false));
    assertThatEndsWith('one', 'one', is(true));
    assertThatEndsWith('one', 'e', is(true));
    assertThatEndsWith('', 'two', is(false));
  });

  describe('trimFromStart', () => {
    const { trimFromStart } = context;

    function assertThatTrimFromStart(stringToTrim, expectedResult) {
      test(stringToTrim, () => {
        expect(trimFromStart(stringToTrim)).toEqual(expectedResult);
      });
    }

    assertThatTrimFromStart('string', is('string'));
    assertThatTrimFromStart('string   ', is('string   '));
    assertThatTrimFromStart('   string', is('string'));
    assertThatTrimFromStart('   string   ', is('string   '));
  });

  describe('trimFromEnd', () => {
    const { trimFromEnd } = context;

    function assertThatTrimFromEnd(stringToTrim, expectedResult) {
      test(stringToTrim, () => {
        expect(trimFromEnd(stringToTrim)).toEqual(expectedResult);
      });
    }

    assertThatTrimFromEnd('string', is('string'));
    assertThatTrimFromEnd('string   ', is('string'));
    assertThatTrimFromEnd('   string', is('   string'));
    assertThatTrimFromEnd('   string   ', is('   string'));
  });

  describe('splitOnFirst', () => {
    const { splitOnFirst } = context;

    function assertThatSplitOnFirst(stringToSplit, separator, expectedResult) {
      test(`split ${quote(stringToSplit)} on first ${quote(separator)}`, () => {
        expect(splitOnFirst(stringToSplit, separator)).toEqual(expectedResult);
      });
    }

    assertThatSplitOnFirst(' one ', ',', is([' one ', '']));
    assertThatSplitOnFirst(' one , two ', ',', is([' one', 'two ']));
    assertThatSplitOnFirst(
      ' one , two , three ',
      ',',
      is([' one', 'two , three '])
    );
    assertThatSplitOnFirst('one,two,three', ',', is(['one', 'two,three']));
    assertThatSplitOnFirst('one->two->three', '->', is(['one', 'two->three']));
  });
});
