import { describe, expect, test } from 'vitest';

import { loadScripts } from '../../load-scripts';

const context = loadScripts(['src/common/lib/Option.js']);

describe('Option.js', () => {
  describe('Option.upgrade (PACKAGE_MENU)', () => {
    const { Option } = context;

    var default_1_4_6 =
      '@1:search(koders) -> http://www.koders.com/?s=##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';
    var default_1_5 =
      '@1:search(Ohloh) -> http://code.ohloh.net/?s=##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';
    var default_1_5_1 =
      '@1:search(Open HUB) -> http://code.openhub.net/?s=##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';
    var default_1_6 =
      '@1:search(krugle) -> http://opensearch.krugle.org/document/search/' +
      '#language=java&query=%20path%3A##PACKAGE_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##';

    test('1.4.6', () => {
      expect(Option.PACKAGE_MENU.upgrade(default_1_4_6, '1.4.6')).toEqual(
        default_1_6
      );
    });

    test('1.5', () => {
      expect(Option.PACKAGE_MENU.upgrade(default_1_5, '1.5')).toEqual(
        default_1_6
      );
    });

    test('1.5.1', () => {
      expect(Option.PACKAGE_MENU.upgrade(default_1_5_1, '1.5.1')).toEqual(
        default_1_6
      );
    });

    test('1.6', () => {
      expect(Option.PACKAGE_MENU.upgrade(default_1_6, '1.6')).toEqual(
        default_1_6
      );
    });
  });

  describe('Option.upgrade (CLASS_MENU)', () => {
    const { Option } = context;

    var default_1_4_6 =
      '@1:search(koders) -> http://www.koders.com/' +
      '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html';
    var default_1_5 =
      '@1:search(Ohloh) -> http://code.ohloh.net/' +
      '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html\n' +
      '@4:search(grepcode) -> http://grepcode.com/' +
      'search/?query=##PACKAGE_NAME##.##CLASS_NAME##.##MEMBER_NAME##';
    var default_1_5_1 =
      '@1:search(Open HUB) -> http://code.openhub.net/' +
      '?s=##PACKAGE_NAME##+##CLASS_NAME##+##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html\n' +
      '@4:search(grepcode) -> http://grepcode.com/' +
      'search/?query=##PACKAGE_NAME##.##CLASS_NAME##.##MEMBER_NAME##';
    var default_1_6 =
      '@1:search(krugle) -> http://opensearch.krugle.org/document/search/' +
      '#language=java&query=##CLASS_NAME##%20##MEMBER_NAME##\n' +
      '@2:search(Docjar) -> http://www.docjar.com/s.jsp?q=##CLASS_NAME##\n' +
      '@3:source(Docjar) -> http://www.docjar.com/html/api/' +
      '##PACKAGE_PATH##/##CLASS_NAME##.java.html\n' +
      '@4:search(grepcode) -> http://grepcode.com/' +
      'search/?query=##PACKAGE_NAME##.##CLASS_NAME##.##MEMBER_NAME##';

    test('1.4.6', () => {
      expect(Option.CLASS_MENU.upgrade(default_1_4_6, '1.4.6')).toEqual(
        default_1_6
      );
    });

    test('1.5', () => {
      expect(Option.CLASS_MENU.upgrade(default_1_5, '1.5')).toEqual(
        default_1_6
      );
    });

    test('1.5.1', () => {
      expect(Option.CLASS_MENU.upgrade(default_1_5_1, '1.5.1')).toEqual(
        default_1_6
      );
    });

    test('1.6', () => {
      expect(Option.CLASS_MENU.upgrade(default_1_6, '1.6')).toEqual(
        default_1_6
      );
    });
  });
});
