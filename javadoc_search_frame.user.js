// ==UserScript==
// @name          Javadoc Search Frame
// @namespace     http://userscripts.org/users/46156
// @description   Incremental search frame for Javadoc packages and classes. Last updated 3rd March 2008.
// @include       */allclasses-frame.html
// ==/UserScript==
// 
// Copyright (c) 2008 Steven G Brown
// 
// Modified from Javadoc Incremental Search version 0.5:
// http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html
// Copyright (c) 2006 KOSEKI Kengo
// 
// Changes from Javadoc Incremental Search version 0.5:
// - The packages frame and the classes frame are merged into a single frame.
//   The search field allows searching all packages and classes at once.
//   Classes can be searched for by simple name or canonical name.
// - When the search field has the focus, the CTRL+Enter key combination will
//   open the package or class displayed at the top of the search frame in a
//   new tab.
// - The escape key can be used to clear the search field.
// - Added Firefox user preferences to allow the behaviour of the script to be
//   customised:
//     auto_open -    true to automatically open the first package or class
//                    in the list after each search, false to wait for the user
//                    to open the package or class manually. Default is false.
//     class_menu -   menu displayed when pressing the '@' key if a class is
//                    currently displayed at the top of the search list.
//     package_menu - menu displayed when pressing the '@' key if a package is
//                    currently displayed at the top of the search list.
//     log          - true to display logging information to the Firefox Error
//                    Console, false to not display this information. Default
//                    is false.
// - A new search is performed when the user has finished typing characters
//   into the search field, rather than after each keypress.
// - Removed usages of unsafeWindow.
// 
// This script requires Firefox 1.5 or later.
// 
// This script is distributed under the MIT licence.
// http://www.opensource.org/licenses/mit-license.php
//

(function() {

String.prototype.endsWith = function (s) {
    var strIndex = this.length - s.length;
    return strIndex >= 0 && this.substring(strIndex) == s;
};

const SEARCH_ACCESS_KEY = "s";
const ERASE_ACCESS_KEY = "a";

const XPATH_HEADING = "//font[@class='FrameHeadingFont']/b";
const XPATH_CONTAINER = "//font[@class='FrameItemFont']";
const XPATH_MENU_LINK = "//a";

const ICON_ERASE = "data:image/gif;base64,R0lGODlhDQANAJEDAM%2FPz%2F%2F%2F%2F93d3UpihSH5BAEAAAMALAAAAAANAA0AAAIwnCegcpcg4nIw2sRGDZYnBAWiIHJQRZbec5XXEqnrmXIupMWdZGCXlAGhJg0h7lAAADs%3D";

const MENU_REPLACEMENT = {
    CLASS_NAME: function(classLink) { 
        return classLink.className;
    },

    PACKAGE_NAME: function(classLink) { 
        return classLink.packageName; 
    },

    PACKAGE_PATH: function(classLink) { 
        return classLink.packageName.replace(/\./g, "/");
    },

    ANCHOR_NAME: function(classLink, anchorLink) {
        if (anchorLink == null) {
            return "";
        }
        return anchorLink.getNameWithoutParameter();
    }
};

const AUTO_OPEN_PREFERENCE = new UserPreference("auto_open", false);

const PACKAGE_MENU_PREFERENCE = new UserPreference("package_menu",
"<a href='http://www.koders.com/?s=##PACKAGE_NAME##' target='classFrame'>@1:search(koders)</a><br/>" +
"<a href='http://www.docjar.com/s.jsp?q=##PACKAGE_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>");

const CLASS_MENU_PREFERENCE = new UserPreference("class_menu",
"<a href='http://www.koders.com/?s=##PACKAGE_NAME##+##CLASS_NAME##+##ANCHOR_NAME##' target='classFrame'>@1:search(koders)</a><br/>" +
"<a href='http://www.docjar.com/s.jsp?q=##CLASS_NAME##' target='classFrame'>@2:search(Docjar)</a><br/>" +
"<a href='http://www.docjar.com/html/api/##PACKAGE_PATH##/##CLASS_NAME##.java.html' target='classFrame'>@3:source(Docjar)</a><br/>");

const LOG_PREFERENCE = new UserPreference("log", false);

var allClassLinks = new Array();
var currentClassLinks = new Array();
var topClassLink = null;
var topAnchorLink = null;
var defaultHTML = null;
var initialized = false;
var isAll = false;
var lastAutoOpenUrl = null;

var view = new View();
var query = new Query(view);
var previousQuery = null;
var anchorsLoader = new AnchorsLoader();
var anchorsCache = new AnchorsCache();

/*
 * main
 */
function init() {
    // If a user preference does not exist, write the default value.
    AUTO_OPEN_PREFERENCE.get();
    PACKAGE_MENU_PREFERENCE.get();
    CLASS_MENU_PREFERENCE.get();
    LOG_PREFERENCE.get();

    // Initialise stored class links.
    allClassLinks = getAllClassLinks();
    if (allClassLinks.length <= 0) {
        return false;
    }
    for (i = 0; i < allClassLinks.length; i++) {
        currentClassLinks.push(i);
    }
    topClassLink = getTopClassLink();

    // Initialise class frame.
    view.initContainer();
    var container = view.getContainer();
    var node = container.createContentNode();
    container.setContentNode(node);
    node.innerHTML = defaultHTML;
    view.initSearchField();

    // Hide the package list frame.
    var frameset = top.document.getElementsByTagName("frameset")[0].getElementsByTagName("frameset")[0];
    if (frameset != undefined) {
        frameset.setAttribute("rows", "0,*");
        frameset.setAttribute("border", 0);
        frameset.setAttribute("frameborder", 0);
        frameset.setAttribute("framespacing", 0);
        scroll(0, 0);
    }

    // Give the search field focus.
    view.focusField();

    return true;
}

function search() {
    logTimeStart();
    if (! initialized) {
        return;
    }

    if (query.isMenuMode()) {
        if (query.isModeChanged()) {
            showMenu();
        } else {
            selectMenu();
        }
    } else if (query.isAnchorMode()) {
        if (query.isModeChanged()) {
            loadAnchors();
        } else {
            selectAnchors();
        }
    } else {
        selectClasses();
    }
    logTimeStop();
}

function getAllClassLinks() {
    var classLinks = new Array();
    var cl;
    var i = 0;
    var matches;
    defaultHTML = "";

    // add packages to class links
    var packagesHeader = getHeaderClassLink("<b>Packages</b>", i);
    classLinks.push(packagesHeader);
    defaultHTML += packagesHeader.html;

    var packageFrame = top.frames[0];
    if (packageFrame.name == "packageListFrame") {
        var packagesInnerHtml = packageFrame.document.body.innerHTML;
        var packagesRegex = /<a [^>]+>([^<]+)<\/a\s*>/gi;
        while ((matches = packagesRegex.exec(packagesInnerHtml)) != null) {
            if (matches[1] != "All Classes") {
                var html = matches[0]
                        .replace("package-frame.html", "package-summary.html")
                        .replace("target=\"packageFrame\"", "target=\"classFrame\"");
                cl = getPackageClassLink(matches[1], html, i);
                classLinks.push(cl);
                defaultHTML += cl.html;
                i++;
            }
        }
    }

    // add interfaces, classes, enumerations, and annotations to class links
    var classLinksMap = new Array();
    var classLinksDefaultHTMLMap = new Array();
    var classLinksMapKeys = new Array("interface", "class", "enum", "exception", "error", "annotation");
    for (keyIndex = 0; keyIndex < classLinksMapKeys.length; keyIndex++) {
        classLinksMap[classLinksMapKeys[keyIndex]] = new Array();
        classLinksDefaultHTMLMap[classLinksMapKeys[keyIndex]] = "";
    }
    var classesInnerHtml = document.body.innerHTML;
    var classesRegex = /<a [^>]*title=\"([^\s]+) in ([^\"]+)[^>]*>(<i\s*>)?([^<]+)(<\/i\s*>)?<\/a\s*>/gi;
    var type;
    while ((matches = classesRegex.exec(classesInnerHtml)) != null) {
        cl = getClassLink(
                matches[2], matches[4], matches[0] + " [ " + matches[2] + " ]", i);
        type = matches[1];
        if (type == "class") {
             if (matches[4].endsWith("Exception")) {
                 type = "exception";
             } else if (matches[4].endsWith("Error")) {
                 type = "error";
             }
        }
        classLinksMap[type].push(cl);
        classLinksDefaultHTMLMap[type] += cl.html;
        i++;
    }
    headers = new Array("Interfaces", "Classes", "Enums", "Exceptions", "Errors", "Annotation Types");
    for (i = 0; i < headers.length; i++) {
        var headerClassLink = getHeaderClassLink("<br/><b>" + headers[i] + "</b>", i);
        classLinks.push(headerClassLink);
        defaultHTML += headerClassLink.html;
        classLinks = classLinks.concat(classLinksMap[classLinksMapKeys[i]]);
        defaultHTML += classLinksDefaultHTMLMap[classLinksMapKeys[i]];
    }
    
    return classLinks;
}

function getTopClassLink() {
  for (i = 0; i < currentClassLinks.length; i++) {
    var cl = allClassLinks[currentClassLinks[i]];
    if (!cl.isHeader()) {
      return cl;
    }
  }
  return null;
}

function selectClasses() {
    if (previousQuery != null && previousQuery.equals(query)) {
        return;
    }

    var container = view.getContainer();
    var node = container.createContentNode();

    if (query.isSelectAll()) {
        node.innerHTML = defaultHTML;
        container.setContentNode(node);
        currentClassLinks = new Array();
        for (i = 0; i < allClassLinks.length; i++) {
            currentClassLinks.push(i);
        }
        topClassLink = getTopClassLink();
    } else {
        var condition = query.createClassLinkCondition();
        appendClasses(condition, node);
        container.setContentNode(node);
    }

    if (topClassLink != null && AUTO_OPEN_PREFERENCE.get()) {
        var url = topClassLink.getUrl();
        if (url != lastAutoOpenUrl) {
            lastAutoOpenUrl = url;
            openInClassFrame(url);
        }
    }

    previousQuery = new PreviousQuery(query);
}

function appendClasses(condition, parent) {
    if (previousQuery != null && previousQuery.search.length > 0
            && previousQuery.search.indexOf(query.search) == 0) {
        var previousClassLinks = new Array(allClassLinks.length);
        for (var i = 0; i < currentClassLinks.length; i++) {
            previousClassLinks[currentClassLinks[i]] = true;
        }
        currentClassLinks = new Array();
        for (i = 0; i < allClassLinks.length; i++) {
            currentClassLinks.push(i);
        }
        currentClassLinks = currentClassLinks.filter(function(clIndex) {
            return previousClassLinks[clIndex] || condition(allClassLinks[clIndex]);
        });
    } else {
        if (previousQuery == null || query.search.indexOf(previousQuery.search) != 0) {
            currentClassLinks = new Array();
            for (i = 0; i < allClassLinks.length; i++) {
                currentClassLinks.push(i);
            }
        }
        currentClassLinks = currentClassLinks.filter(function(clIndex) {
            var cl = allClassLinks[clIndex];
            return cl.isHeader() || condition(cl);
        });
    }

    topClassLink = getTopClassLink();

    var html = "";
    currentClassLinks.forEach(function(clIndex) {
        html += allClassLinks[clIndex].html;
    });

    parent.innerHTML = html;
}

function loadAnchors() {
    if (topClassLink != null) {
      view.selectClass(topClassLink);
      view.getSubContainer().print("loading...");
      anchorsLoader.load(topClassLink);
    }
}

function selectAnchors() {
    if (topClassLink == null || ! anchorsCache.contains(topClassLink)) {
        return;
    }
    previousQuery = null;
    var condition = query.createAnchorLinkCondition();
    var container = view.getSubContainer();
    var node = container.createContentNode();
    anchorsCache.appendAnchors(node, topClassLink, condition);
    container.setContentNode(node);
}

function updateAnchors() {
    if (query.isAnchorMode()) {
        selectAnchors(query.getSearchString());
    }
}

function openInNewTab(url) {
    window.open(url);
}

function openInClassFrame(url) {
    if (window.parent.frames[2] != null) {
        window.parent.frames[2].location.href = url;
        return true;
    }
}

function showMenu() {
    if (topClassLink == null) {
      return;
    }
    view.selectClass(topClassLink);
    var container = view.getSubContainer();
    var node = container.createContentNode();
    var content;
    if (topClassLink.isPackage()) {
        content = PACKAGE_MENU_PREFERENCE.get();
    } else {
        content = CLASS_MENU_PREFERENCE.get();
    }
    var rx = /##(\w+)##/;
    var matches;
    while ((matches = rx.exec(content)) != null) {
        var f = MENU_REPLACEMENT[matches[1]];
        var rx2 = new RegExp("##" + matches[1] + "##", "g");
        if (f == null) {
            content = content.replace(rx2, "");
        } else {
            var anchorLink = null;
            if (query.isAnchorSearchStarted()) {
                anchorLink = topAnchorLink;
            }
            content = content.replace(rx2, f(topClassLink, anchorLink));
        }
    }
    node.innerHTML = content;
    container.setContentNode(node);
}

function selectMenu() {
    if (query.getSearchString() == "") {
        return;
    }

    var node = view.getSubContainer().getNode();
    var xpathResult = document.evaluate(XPATH_MENU_LINK, node, null, 
                                        XPathResult.ANY_TYPE, null);
    var node;
    while ((node = xpathResult.iterateNext()) != null) {
        var textNode = node.firstChild;
        if (textNode != null 
            && textNode.nodeType == 3 /* Node.TEXT_NODE */
            && textNode.nodeValue.indexOf("@" + query.getSearchString()) == 0) {
            openMenu(node);
            query.input("");
            search();
            return;
        }
    }
    query.update("@");
}

function openMenu(node) {
    var href = node.getAttribute("href");
    openInClassFrame(href);
}

/*
 * event handlers
 */
function searchFieldKeyup(e) {
    var code = e.keyCode;
    if (code == 13) {
        returnKeyPressed(e.ctrlKey);
    } else if (code == 27) {
        escapeKeyPressed();
    }
}

function searchFieldChanged(input) {
    query.input(input);
    search();
}

function returnKeyPressed(controlModifier) {
    var url = null;
    if (query.isClassMode() && topClassLink != null) {
        url = topClassLink.getUrl();
    } else if (query.isAnchorMode()) {
        url = topAnchorLink.getUrl();
    }

    if (url != null) {
        if (controlModifier) {
            openInNewTab(url);
        } else {
            openInClassFrame(url);
        }
    }
}

function searchFieldFocus(e) {
    document.body.scrollLeft = 0;
}

function eraseButtonClick() {
    query.erase();
    view.focusField();
    search();
}

function escapeKeyPressed() {
    query.erase();
    search();
}


/**
 * ClassLink
 */
function getHeaderClassLink(html, idx) {
    return new ClassLink("", "", html, idx);
}

function getPackageClassLink(packageName, html, idx) {
    return new ClassLink(packageName, "", html, idx);
}

function getClassLink(packageName, className, html, idx) {
    return new ClassLink(packageName, className, html, idx);
}

function ClassLink(packageName, className, html, idx) {
    this.packageName = packageName;
    this.className = className;
    this.html = html + "<br/>";
    this.url = null;
    if (packageName == "") {
        this.canonicalName = className;
    } else {
        this.canonicalName = packageName + "." + className;
    }
}

ClassLink.prototype.isHeader = function() {
    return this.packageName == "";
}

ClassLink.prototype.isClass = function() {
    return this.className != "";
}

ClassLink.prototype.isPackage = function() {
    return !this.isHeader() && !this.isClass();
}

ClassLink.prototype.getUrl = function() {
    if (this.url != null) {
        return this.url;
    }
    
    var rx = /href\s*=\s*(?:"|')([^"']+)(?:"|')/;
    var matches;
    if ((matches = rx.exec(this.html)) != null) {
        this.url = matches[1];
        return this.url;
    }
    return null;
}

/**
 * Query
 */
function Query(view) {
    this.mode = 1;
    this.modeChanged = false;

    this.search = "";
    this.lastClassSearch = "";
    this.lastAnchorSearch = "";
    this.view = view;
}

Query.CLASS_MODE = 1;
Query.ANCHOR_MODE = 2;
Query.MENU_MODE = 3;

Query.prototype.getSearchString = function() {
    return this.search;
}

Query.prototype.isModeChanged = function() {
    return this.modeChanged;
}

Query.prototype.isSelectAll = function() {
    return (this.search.length == 0 || this.search == "*");
}

Query.prototype.isAnchorSearchStarted = function() {
    if (this.isAnchorMode()) {
        return (0 < this.searchString.length);
    } else if (this.isMenuMode()) {
        return (1 < this.lastAnchorSearch.length); // lastAnchorSearch starts with '#'
    }
    return false;
}

Query.prototype.createClassLinkCondition = function() {
    var pattern = this.getRegex();

    return function(o) {
        return o.className.match(pattern) || o.canonicalName.match(pattern);
    };
}

Query.prototype.createAnchorLinkCondition = function() {
    var pattern = this.getRegex();

    return function(o) {
        return o.name.match(pattern);
    };
}

Query.prototype.getRegex = function() {
    var q = this.search.replace(/\./g, "\\\.").replace(/\*/g, "\.\*");
    var pattern = "^";
    for (i = 0; i < q.length; i++) {
        var character = q.charAt(i);
        if (/[A-Z]/.test(character)) {
            pattern += "(([a-z]*\.?" + character + ")|" + character.toLowerCase() + ")";
        } else if (/[a-z]/.test(character)) {
            pattern += "(" + character.toUpperCase() + "|" + character + ")";
        } else {
            pattern += character;
        }
    }
    pattern += ".*";
    return pattern;
}

Query.prototype.input = function(input) {
    var lastMode = this.mode;
    input = this._shiftMode(input);
    this.modeChanged  = (lastMode != this.mode);
    this.search = this._getSearchStringFromInput(input);
}

Query.prototype.update = function(input) {
    this.view.setFieldValue(input);
    this.input(input);
}

Query.prototype.erase = function() {
    if (this.isAnchorMode() && 0 < this.search.length) {
        this.update("#");
    } else {
        this.update("");
    }
}

Query.prototype._getSearchStringFromInput = function(input) {
    if (this.isMenuMode()) {
        if (input.length <= 1) {
            return "";
        } else {
            return input.substring(1, 2);
        }
    } else if (this.isAnchorMode()) {
        if (0 < input.lastIndexOf("#")) {
            view.setFieldValue("#");
            return "";
        } else {
            input = input.substring(1);
            return this._normalize(input);
        }
    } else if (this.isClassMode()) {
        return this._normalize(input);
    } else {
        return "";
    }
}

Query.prototype._normalize = function(input) {
    input = this._concatStars(input);
    input = this._removeLastStar(input);
    return input;
}

Query.prototype._shiftMode = function(input) {
    if (input.indexOf("@") != -1) {
        if (this.isMenuMode()) {
            return input;
        }
        // * -> menuMode
        var lastSearch = input.replace(/@/g, "");
        this._memoryLastSearch(lastSearch);
        this.view.setFieldValue("@");
        this.mode = Query.MENU_MODE;
        return "@";
    } else if (input.indexOf("#") != -1) {
        if (this.isAnchorMode()) {
            return input;
        }
        // * -> anchorMode
        var lastSearch = input.replace(/#/g, "");
        this._memoryLastSearch(lastSearch);
        this.view.setFieldValue("#");
        this.mode = Query.ANCHOR_MODE;
        return "#";
    } else if (this.isMenuMode() && this.lastAnchorSearch != "") {
        // menuMode -> anchorMode
        this.view.setFieldValue(this.lastAnchorSearch);
        input = this.lastAnchorSearch;
        this.lastAnchorSearch = "";
        this.mode = Query.ANCHOR_MODE;
        return input;
    } else if (! this.isClassMode()) {
        // * -> classMode
        this.view.setFieldValue(this.lastClassSearch);
        input = this.lastClassSearch;
        this.lastAnchorSearch = "";
        this.lastClassSearch = "";
        this.mode = Query.CLASS_MODE;
        return input;
    }
    return input;
}

Query.prototype._memoryLastSearch = function(lastSearch) {
    if (this.isClassMode()) {
        this.lastClassSearch = lastSearch;
        this.lastAnchorSearch = "";
        this.search = "";
    } else if (this.isAnchorMode()) {
        this.lastAnchorSearch = lastSearch;
        this.search = "";
    }
}

Query.prototype._removeLastStar = function(s) {
    if (s.lastIndexOf("*") == s.length - 1) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}

Query.prototype._concatStars = function(s) {
    return s.replace(/\*+/, "*");
}

Query.prototype.isClassMode = function() {
    return this.mode == Query.CLASS_MODE;
}

Query.prototype.isAnchorMode = function() {
    return this.mode == Query.ANCHOR_MODE;
}

Query.prototype.isMenuMode = function() {
    return this.mode == Query.MENU_MODE;
}

/**
 * PreviousQuery
 */
function PreviousQuery(query) {
    this.mode = query.mode;
    this.search = query.search;
}

PreviousQuery.prototype.equals = function(query) {
    return query != null && this.mode == query.mode && this.search == query.search;
}

/**
 * View
 */
function View() {
    this.field = null;
    this.container = null;
    this.subContainer = null;
}

View.prototype.getContainer = function() {
    return this.container;
}

View.prototype.getSubContainer = function() {
    return this.subContainer;
}

View.prototype.setFieldValue = function(v) {
    this.field.value = v;
}

View.prototype.getFieldValue = function() {
    return this.field.value;
}

View.prototype.getFieldElement = function() {
    return this.field;
}

View.prototype.focusField = function() {
    this.field.focus();
}

View.prototype.selectClass = function(classLink) {
    var node = this.container.createContentNode();
    
    node.innerHTML = classLink.html;
    node.appendChild(this.subContainer.getParent());
    this.container.setContentNode(node);
}

View.prototype.initSearchField = function() {
    var node = this._getHeadingNode();
    if (node == null) {
        return;
    }

    node.removeChild(node.firstChild);

    this.field = this._createSearchField();
    node.appendChild(this.field);

    var eraseButton = this._createEraseButton();
    node.appendChild(eraseButton);
}

View.prototype.initContainer = function() {
    var xpathResult = selectAnyType(XPATH_CONTAINER);
    var node = xpathResult.iterateNext();
    if (node == null) {
        return false;
    }
    this.container = new Container(node);

    node = this._createSubContainerNode();
    this.subContainer = new Container(node);
}

View.prototype._getHeadingNode = function() {
    var xpathResult = selectAnyType(XPATH_HEADING);
    return xpathResult.iterateNext();
}

View.prototype._createSearchField = function() {
    var s = document.createElement("input");
    s.setAttribute("type", "text");
    s.addEventListener("keyup", searchFieldKeyup, false);
    s.addEventListener("onchange", searchFieldChanged, false);
    s.addEventListener("focus", searchFieldFocus, false);

    if (SEARCH_ACCESS_KEY != null && SEARCH_ACCESS_KEY != "") {
        s.setAttribute("accesskey", SEARCH_ACCESS_KEY);
    }

    return s;
}

View.prototype._createEraseButton = function() {
    var e = document.createElement("input");
    e.setAttribute("type", "image");
    e.setAttribute("src", ICON_ERASE);
    e.setAttribute("style", "margin-left: 3px");
    e.addEventListener("click", eraseButtonClick, false);

    if (ERASE_ACCESS_KEY != null && ERASE_ACCESS_KEY != "") {
        e.setAttribute("accesskey", ERASE_ACCESS_KEY);
    }

    return e;
}

View.prototype._createSubContainerNode = function() {
    var parent = document.createElement("span");
    var node = document.createElement("ul");
    node.setAttribute("style", "list-style-type:none; padding:0");
    parent.appendChild(node);
    return node;
}


/**
 * Container
 */
function Container(masterNode) {
    this.parent = masterNode.parentNode;
    this.master = masterNode;
    this.current = null;
}

Container.prototype.clear = function() {
    if (this.parent.hasChildNodes()) {
        this.parent.removeChild(this.parent.firstChild);
    }
    this.current = null;
}

Container.prototype.createContentNode = function() {
    return this.master.cloneNode(false);
}

Container.prototype.setContentNode = function(node) {
    if (this.parent.hasChildNodes()) {
        this.parent.replaceChild(node, this.parent.firstChild);
    } else {
        this.parent.appendChild(node);
    }
    this.current = node;
}

Container.prototype.getNode = function() {
    return this.current;
}

Container.prototype.getParent = function() {
    return this.parent;
}

Container.prototype.print = function(msg) {
    var node = document.createTextNode(msg);
    this.setContentNode(node);
}

Container.prototype.setOriginal = function() {
    this.setContentNode(this.master);
}


/**
 * AnchorsLoader
 */
function AnchorsLoader() {
}

AnchorsLoader.prototype.load = function(classLink) {
    if (anchorsCache.contains(classLink)) {
        updateAnchors();
        return;
    }
    var handler = new AnchorsRequestHandler();
    try {
        var req = new XMLHttpRequest();
        req.open("GET", classLink.getUrl(), true);
        req.onreadystatechange = function() { 
            if (req.readyState == 2) {
                handler.loaded(req, classLink);
            } else if (req.readyState == 4 && req.responseText) { 
                handler.completed(req, classLink);
            }
        };
        req.send("");
    } catch(e) {
        var p = new Object();
        p.method = "GET";
        p.url = classLink.getUrl();
        p.onreadystatechange = function(res) {
            if (res.readyState == 2) {
                handler.loaded(res, classLink);
            } else if (res.readyState == 4 && res.responseText) { 
                handler.completed(res, classLink);
            }
        }
        GM_xmlhttpRequest(p);
    }
}

/**
 * AnchorsRequestHandler
 */
function AnchorsRequestHandler() {
}

AnchorsRequestHandler.prototype.loaded = function(req, classLink) {
    view.getSubContainer().print("parsing...");
}

AnchorsRequestHandler.prototype.completed = function(req, classLink) {
    if (! query.isAnchorMode() || classLink != topClassLink) {
        return;
    }
    var names = this._getAnchorNames(req.responseText);
    var nodes = this._createAnchorLinkArray(classLink.getUrl(), names);
    anchorsCache.add(classLink, nodes);
    updateAnchors();
}

AnchorsRequestHandler.prototype._createAnchorLinkArray = function(baseurl, 
                                                                  names) {
    var nodes = new Array();
    var keywordNodes = new Array();
    for (var i = 0; i < names.length; i++) {
        var node = new AnchorLink(baseurl, names[i]);
        if (node.isKeyword()) {
            keywordNodes.push(node);
        } else {
            nodes.push(node);
        }
    }
    for (var i = 0; i < keywordNodes.length; i++) {
        nodes.push(keywordNodes[i]);
    }
    return nodes;
}

AnchorsRequestHandler.prototype._getAnchorNames = function(doc) {
    var pat = /<A NAME=\"([^\"]+)\"/gi;
    var i = 0;
    var matches;
    var names = new Array();
    while ((matches = pat.exec(doc)) != null) {
        names.push(matches[1]);
    }
    return names;
}

/**
 * AnchorLink
 */
function AnchorLink(baseurl, name) {
    this.name = name;
    this.lowerName = name.toLowerCase();
    this.url = baseurl + "#" + name;
    this.keywordOrNot = this._getKeywordOrNot(name);
    this.html = this._getHtml(name, this.url, this.keywordOrNot);
}

AnchorLink.prototype.getLowerName = function() {
    return this.lowerName;
}

AnchorLink.prototype.getUrl = function() {
    return this.url;
}

AnchorLink.prototype.isKeyword = function() {
    return this.keywordOrNot;
}

AnchorLink.prototype.getNameWithoutParameter = function() {
    if (this.name.indexOf("(") != -1) {
        return this.name.substring(0, this.name.indexOf("("));
    } else {
        return this.name;
    }
}

AnchorLink.keywords = {
    "navbar_top":1,
    "navbar_top_firstrow":1,
    "skip-navbar_top":1,
    "field_summary":1,
    "nested_class_summary":1,
    "constructor_summary":1,
    "constructor_detail":1,
    "method_summary":1,
    "method_detail":1,
    "field_detail":1,
    "navbar_bottom":1,
    "navbar_bottom_firstrow":1,
    "skip-navbar_bottom":1
};

AnchorLink.keywordPrefixes = [
    "methods_inherited_from_",
    "fields_inherited_from_",
    "nested_classes_inherited_from_"
];

AnchorLink.prototype._getKeywordOrNot = function(name) {
    if (AnchorLink.keywords[name] == 1) {
        return true;
    }
    for (var i = 0; i < AnchorLink.keywordPrefixes.length; i++) {
        if (name.indexOf(AnchorLink.keywordPrefixes[i]) == 0) {
            return true;
        }
    }
    return false;
}

AnchorLink.prototype._getHtml = function(name, url, keywordOrNot) {
    var html = "<li><a href=\"" + url + "\" target=\"classFrame\" class=\"anchorLink\"";
    if (keywordOrNot) {
        html += " style=\"color:#666\"";
    }
    html += ">" + name + "</a></li>";
    return html;
}

/**
 * AnchorsCache
 */
function AnchorsCache() {
    this.cache = new Array();
}

AnchorsCache.prototype.add = function(classLink, anchors) {
    this.cache[classLink.getUrl()] = anchors;
}

AnchorsCache.prototype.contains = function(classLink) {
    return (this.cache[classLink.getUrl()] != null);
}

AnchorsCache.prototype.appendAnchors = function(parent, classLink, condition) {
    var anchorLinks = this.cache[classLink.getUrl()];
    if (anchorLinks == null) {
        return;
    }
    
    topAnchorLink = null;
    var html = "";
    var count = 0;
    for (var i = 0; i < anchorLinks.length; i++) {
        var al = anchorLinks[i];
        if (condition(al)) {
            count++;
            html += al.html;
            if (topAnchorLink == null) {
                topAnchorLink = al;
            }
        }
    }
    
    if (topAnchorLink != null && AUTO_OPEN_PREFERENCE.get() && ! query.isModeChanged()) {
        var url = topAnchorLink.getUrl();
        if (url != lastAutoOpenUrl) {
            lastAutoOpenUrl = url;
            openInClassFrame(url);
        }
    }
    
    parent.innerHTML = html;
}

/**
 * UserPreference
 */
function UserPreference(key, defaultValue) {
    this.key = key;
    this.defaultValue = defaultValue;
}

UserPreference.prototype.get = function() {
    var value = (GM_getValue) ? GM_getValue(this.key) : undefined;
    if (value == undefined) {
        value = this.defaultValue;
        if (GM_setValue) {
            GM_setValue(this.key, value);
        }
    }
    return value;
}

initialized = init();
watch(view.getFieldElement(), searchFieldChanged);

/*
 * utils
 */
function selectAnyType(xpath) {
    return document.evaluate(xpath, document, null, 
                             XPathResult.ANY_TYPE, null);
}

function watch(element, callback, msec) {
    var elementChanged = false;
    var old;
    setInterval(function(){
        var q = element.value;
        if (elementChanged && old == q) {
            elementChanged = false;
            callback(q);
        } else if (old != q) {
            elementChanged = true;
        }
        old = q;
    }, msec || 200)
}

/*
 * Stopwatch used to log the time taken for the search() function to run.
 */

var startTimeMs = 0;

function logTimeStart() {
  startTimeMs = new Date().getTime();
}

function logTimeStop() {
  if (GM_log && LOG_PREFERENCE.get()) {
    var deltaTimeMs = new Date().getTime() - startTimeMs;
    GM_log("'" + query.getSearchString() + "' in " + deltaTimeMs + "ms\n" + query.getRegex());
  }
}

})();
