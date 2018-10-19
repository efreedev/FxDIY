/* :::::::: Sub-Script/Overlay Loader v3.0.57mod ::::::::::::::: */

// 自动包含配置档的 chrome 文件夹中的所有以 .uc.xul 和 .uc.js 结尾的文件。

// 新功能:
// 支持 Greasemonkey 风格的 metadata 用于 userChrome 脚本(uc.js)和 overlays(uc.xul)
// 在 include/exclude 行中支持“main”快捷方式用于主浏览器窗口
// 在 include/exclude 行中支持正则表达式
// 为了向后兼容，不带 metadata 的脚本将只会在主浏览器窗口上运行
//
// 1.包括 UCJS_loader 的功能
// 2.和 Fx2 及 Fx3.0b5pre 兼容
// 3.缓存的脚本数据 (path, leafname, regex)
// 4.支持 window.userChrome_js.loadOverlay(overlay [,observer]) //
// 由 Alice0775 修改
//
// Date 2018/08/10 01:30 修复 63.0a1
// Date 2018/08/02 19:30 用于 userChrome.xml
// Date 2018/05/30 18:00 总是执行 .uc.js
// Date 2018/05/06 22:00 修复错误的提交
// Date 2018/05/06 22:00 移除了对 editBookmarkPanel 的变通方案
// Date 2018/03/21 08:00 倒退 USE_0_63_FOLDER
// Date 2018/03/20 21:00 editBookmarkPanel 等的 Bug 1444228 - 移除 editBookmarkOverlay.xul
// Date 2015/06/28 13:00 about:preferences#privacy 等
// Date 2014/12/28 19:00 变通解决在第二个浏览器上加载 XUL
// Date 2014/12/13 21:00 移除了一个调试日志
// Date 2014/12/13 21:00 允许加载脚本到对话框中的 about:
// Date 2014/12/13 21:00 需要 userchrome.js-0.8.014121301-Fx31.xpi
// Date 2014/06/07 21:00 通过 about:blank
// Date 2014/06/07 19:00 按默认关闭 experiment
// Date 2014/06/04 12:00 修复了关机崩溃的可能性 Bug 1016875
// Date 2014/05/19 00:00 延迟 0，试验性
// Date 2013/10/06 00:00 允许加载脚本到 about:xxx 中
// Date 2013/09/13 00:00 Bug 856437 移除 Components.lookupMethod, 移除 REPLACEDOCUMENTOVERLAY
// Date 2012/04/19 23:00 starUIをbindを使うように
// Date 2012/04/19 21:00 starUI元に戻した
// Date 2012/02/04 00:00 由于 bug 726444 实现了下载面板。
// Date 2012/02/04 00:00 由于 bug 726440
// Date 2011/11/19 15:30 REPLACECACHE 追加 Bug 648125
// Date 2011/09/30 13:40 修复了 Bug 640158
// Date 2011/09/30 13:00 修复了 Bug 640158
// Date 2011/04/07 00:00 hackVersion
// Date 2010/10/10 00:00 Bug 377498 mozIJSSubscriptLoader::loadSubScript charset 入ったけど元数据 // @charset  UTF-8 としとけばUTF-8で読み込む
// Date 2010/03/31 00:00 XULDocumentのみに適用
// Date 2010/03/11 17:30 debugbuild对应无法使用的情况。
// Date 2010/02/28 13:00 ↓が直っているので元に戻した。
// Date 2009/08/06 00:00 tree_style_tab-0.8.2009073102があるとxulのdocument.overlayが出来なくなる件に対応
// Date 2009/05/23 00:00 userChrome.js0.8.1実験中 v3.0.25mod
// Date 2009/04/13 00:00 overlayのobserveの処理変更 v3.0.24mod
// Date 2009/03/10 00:00 例外トラップ
// Date 2009/02/15 15:00 chromehiddenなwindow(popup等)の場合にロードするかどうかを指定できるようにした。
// Date 2008/12/29 06:00 面倒だからdocument.overlayを置き換えるようにした。
// Date 2008/12/27 18:00 Webpanelにchromeを読み込んだときのエラーが出るのを修正(thanks 音吉)
// Date 2008/09/16 00 00 面倒だからFirefox3 の場合はeditBookmarkOverlay.xulは先読みするように修正
// Date 2008/08/28 00 00 なぜか0.8.0+を使っている人がいたので, それに対応
// Date 2008/08/26 23:50 08/26 18:00 以降 Fx2で動かなくなったようなので, 直した
// Date 2008/08/26 22:00 v3.0.11modで動かないなら,これ以降のものも動かないよ。たぶん
// Date 2008/08/26 18:00 Fx3のStarUIをなん或して欲しいな。
// Date 2008/08/18 04:00 AUTOREMOVEBOM = trueなら文字コード自動判定するようにした。
// Date 2008/08/16 15:00 BOMを自動的に取り除くかどうか指定できるようにした
// Date 2008/07/29 23:00 なんかバグあったかも
// Date 2008/07/25 00:00 USE_0_63_FOLDER及FORCESORTSCRIPTがtrueの場合は, フォルダも名順でソートするようにした
// Date 2008/07/14 01:00 typo, regression
// Date 2008/07/14 00:00 typo, regression
// Date 2008/07/13 22:00 サイドバーweb-panelsにchromeウインドウを読み込んだ場合に対応
// Date 2008/03/23 12:00 80氏のフォルダ規則に対応, 0.8mod版本にも対応
//

(function() {
    "use strict";
    // -- config --
    const EXCLUDE_CHROMEHIDDEN = false; //排除chromehidden类窗口(弹出等)的延迟加载: 不延迟为true, 延迟为[false]
    const USE_0_63_FOLDER = false; //使用0.63的文件夹规则[true]，不使用false
    const FORCESORTSCRIPT = false; //强制按文件名排列脚本true,不排序[false](影响执行顺序)
    const AUTOREMOVEBOM = false; //BOM的自动去除:true, 不去除[false](原始文件是保留.BOM不变的)
    const REPLACECACHE = true; //根据脚本的更新日期更新缓存: true , 不使用:[false]
    //=====================USE_0_63_FOLDER = false 时===================
    var UCJS = new Array("UCJSFiles"); //UCJS Loader 应用规范 (在NoScript中允许file:///)
    var arrSubdir = new Array("", "SubScript", "TabMixPlus", "UCJSFiles", "UserContent", "UserMenu"); //脚本将按这个顺序执行
    //===================================================================

    const ALWAYSEXECUTE = ['rebuild_userChrome.uc.xul', 'rebuild_userChrome.uc.js', 'UC脚本管理器.uc.js']; //强制运行的脚本，无视禁用列表
    var INFO = true;
    var BROWSERCHROME = "chrome://browser/content/browser.xul"; //Firfox
    //var BROWSERCHROME = "chrome://navigator/content/navigator.xul"; //SeaMonkey:
    // -- config --

    /* USE_0_63_FOLDER true 时
     * 直接在chrome下以及 chrome/xxx.uc 内的 *.uc.js 及 *.uc.xul
     * chrome/xxx.xul 内的  *.uc.js , *.uc.xul 及 *.xul
     * chrome/xxx.ucjs 内的 *.uc.js 是特别的 UCJS Loader 应用规范(在NoScript中允许file:///)
     */

    /* USE_0.63_FOLDER false 时
     * 为了方便，文件夹被分为任意多个文件夹。 在下面的arrSubdir来指定
     * UCJS Loader指定要在UCJS中应用的文件夹
     * 配置档-+-chrome-+-userChrome.js(本文件)
     *                 +-*.uc.js或*.uc.xul组
     *                 |
     *                 +-SubScript--------+-*.uc.js或*.uc.xul组
     *                 |
     *                 +-UCJSFiles--------+-*.uc.js或*.uc.xul组 (UCJS_loader它只适用于 JavaScript Version 1.7/日本語)
     *                 |
     *                 +-xul--------------+-*.xul, *.uc.xul及付随File
     *                 |
     *                 +-userCrome.js.0.8-+-*.uc.js或*.uc.xul组 (为何拼写这么怪? )
     */

    //若不是 chrome/about 则跳过
    if (!/^(chrome:|about:)/i.test(location.href)) return;
    if (/^(about:(blank|newtab|home))/i.test(location.href)) return;
    //因我们没有用于常用对话框的叠加层(Overlay)，所以跳过以缩短时间
    if (location.href == 'chrome://global/content/commonDialog.xul') return;
    if (location.href == 'chrome://global/content/alerts/alert.xul') return;
    if (/.html?$/i.test(location.href)) return;

    window.userChrome_js = {
        USE_0_63_FOLDER: USE_0_63_FOLDER,
        UCJS: UCJS,
        arrSubdir: arrSubdir,
        FORCESORTSCRIPT: FORCESORTSCRIPT,
        ALWAYSEXECUTE: ALWAYSEXECUTE,
        AUTOREMOVEBOM: AUTOREMOVEBOM,
        INFO: INFO,
        BROWSERCHROME: BROWSERCHROME,
        EXCLUDE_CHROMEHIDDEN: EXCLUDE_CHROMEHIDDEN,
        REPLACECACHE: REPLACECACHE,

        get hackVersion() {
            delete this.hackVersion;
            return this.hackVersion = "0.8";
            //吸收扩展版本的差异
            this.baseUrl = /^(chrome:\/\/\S+\/content\/)\S+/i.test(Error().fileName).$1;
            if (!/^(chrome:\/\/\S+\/content\/)\S+/i.test(Error().fileName)) {} else if (Error().fileName.indexOf("chrome://uc_js/content/uc_js.xul") > -1 ||
                "chrome://userchrome_js_cache/content/userChrome.js" == Error().fileName) { //0.8.0+ 或 0.7
                return this.hackVersion = "0.8+";
            } else if (Error().fileName.indexOf("chrome://browser/content/browser.xul -> ") == 0) {
                return this.hackVersion = "0.8.1";
            } else {
                return this.hackVersion = "0.8mod";
            }
        },

        //创建脚本数据
        getScripts: function() {
            const Cc = Components.classes;
            const Ci = Components.interfaces;
            const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
            const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
            const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
            var Start = new Date().getTime();
            //getdir
            if (this.USE_0_63_FOLDER) {
                var o = [""];
                this.UCJS = [];
                this.arrSubdir = [];
                var workDir = ds.get("UChrm", Ci.nsIFile);
                var dir = workDir.directoryEntries;
                while (dir.hasMoreElements()) {
                    var file = dir.getNext().QueryInterface(Ci.nsIFile);
                    if (!file.isDirectory()) continue;
                    var dirName = file.leafName;
                    if (/(uc|xul|ucjs)$/i.test(dirName)) {
                        o.push(dirName);
                        if (/ucjs$/i.test(dirName)) {
                            this.UCJS.push(dirName);
                        }
                    }
                }
                if (this.FORCESORTSCRIPT) {
                    o.sort(cmp_name);
                }
                [].push.apply(this.arrSubdir, o);
            }

            var that = this;
            var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
            if (mediator.getMostRecentWindow("navigator:browser"))
                var mainWindowURL = that.BROWSERCHROME;
            else if (mediator.getMostRecentWindow("mail:3pane"))
                var mainWindowURL = "chrome://messenger/content/messenger.xul";

            this.dirDisable = restoreState(getPref("userChrome.disable.directory", "str", "").split(','));
            this.scriptDisable = restoreState(getPref("userChrome.disable.script", "str", "").split(','));
            this.scripts = [];
            this.overlays = [];

            var findNextRe = /^\/\/ @(include|exclude)[ \t]+(\S+)/gm;
            this.directory = {
                name: [],
                UCJS: [],
                enable: []
            };
            for (var i = 0, len = this.arrSubdir.length; i < len; i++) {
                var s = [],
                    o = [];
                try {
                    var dir = this.arrSubdir[i] == "" ? "root" : this.arrSubdir[i];
                    this.directory.name.push(dir);
                    this.directory.UCJS.push(checkUCJS(dir));

                    var workDir = ds.get("UChrm", Ci.nsIFile);
                    workDir.append(this.arrSubdir[i]);
                    var files = workDir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
                    var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
                    while (files.hasMoreElements()) {
                        var file = files.getNext().QueryInterface(Ci.nsIFile);
                        if (/\.uc\.js$|\.uc\.xul$/i.test(file.leafName) ||
                            /\.xul$/i.test(file.leafName) && /\xul$/i.test(this.arrSubdir[i])) {
                            var script = getScriptData(
                                this.AUTOREMOVEBOM ? deleteBOMreadFile(file) : readFile(file, true), file);
                            script.dir = dir;
                            if (/\.uc\.js$/i.test(script.filename)) {
                                script.url = convURL(script.url);
                                script.ucjs = checkUCJS(script.file.path);
                                s.push(script);
                            } else {
                                script.xul = '<?xul-overlay href=\"' + script.url + '\"?>\n';
                                o.push(script);
                            }
                        }
                    }
                } catch (e) {}
                if (this.FORCESORTSCRIPT) {
                    s.sort(cmp_fname);
                    o.sort(cmp_fname);
                }
                [].push.apply(this.scripts, s);
                [].push.apply(this.overlays, o);
            }
            this.debug('Parsing getScripts: ' + ((new Date()).getTime() - Start) + 'msec');

            //吸收扩展版本的差异
            function convURL(url) {
                switch (userChrome_js.hackVersion) {
                    case "0.8":
                        return url;
                    case "0.8+": // or 0.7
                        return url;
                    case "0.8.1":
                        return url;
                    case "0.8mod":
                        return userChrome_js.baseUrl + url.substr(url.indexOf("chrome") + 7);
                }
                return url;
            }

            //name比较的函数
            function cmp_name(a, b) {
                if (a.toLowerCase() == b.toLowerCase())
                    return a < b ? -1 : 1;
                else
                    return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
            }

            function cmp_fname(a, b) {
                return cmp_name(a.filename, b.filename);
            }

            //UCJSLoader所需
            function checkUCJS(aPath) {
                for (var i = 0, len = that.UCJS.length; i < len; i++) {
                    if (aPath.indexOf(that.UCJS[i], 0) > -1)
                        return true;
                }
                return false;
            }

            //元数据的收集
            function getScriptData(aContent, aFile) {
                var charset, description, author, namespace, version, homepageURL, reviewURL, downloadURL, updateURL, fullDescription, startup, shutdown;
                var header = (aContent.match(/^\/\/ ==UserScript==[ \t]*\n(?:.*\n)*?\/\/ ==\/UserScript==[ \t]*\n/m) || [""])[0];
                var match, rex = {
                    include: [],
                    exclude: []
                };
                while ((match = findNextRe.exec(header))) {
                    rex[match[1]].push(match[2].replace(/^main$/i, mainWindowURL).replace(/\W/g, "\\$&").replace(/\\\*/g, ".*?"));
                }
                if (rex.include.length == 0) rex.include.push(mainWindowURL);
                var exclude = rex.exclude.length > 0 ? "(?!" + rex.exclude.join("$|") + "$)" : "";

                match = header.match(/\/\/ @charset\b(.+)\s*/i);
                charset = "";
                //try
                if (match)
                    charset = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                match = header.match(/\/\/ @description\b(.+)\s*/i);
                description = "";
                //try
                if (match)
                    description = match.length > 0 ? match[1].replace(/^\s+/, "") : "";
                //}catch(e){}
                if (description == "" || !description)
                    description = aFile.leafName;

                // version
                match = header.match(/\/\/ @version\b(.+)\s*/i);
                version = "";
                if (match && match.length)
                    version = match[1].replace(/^\s+/, "").split(" ")[0];

                // author
                match = header.match(/\/\/ @author\b(.+)\s*/i);
                author = "";
                if (match)
                    author = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // author
                match = header.match(/\/\/ @namespace\b(.+)\s*/i);
                namespace = "";
                if (match)
                    namespace = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                //startup
                match = header.match(/\/\/ @startup\b(.+)\s*/i);
                startup = "";
                if (match)
                    startup = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                //shutdown
                match = header.match(/\/\/ @shutdown\b(.+)\s*/i);
                shutdown = "";
                if (match)
                    shutdown = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // homepageURL
                match = header.match(/\/\/ @homepageURL\b(.+)\s*/i);
                homepageURL = "";
                if (match)
                    homepageURL = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // reviewURL
                match = header.match(/\/\/ @reviewURL\b(.+)\s*/i);
                reviewURL = "";
                if (match)
                    reviewURL = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // downloadURL
                match = header.match(/\/\/ @downloadURL\b(.+)\s*/i);
                downloadURL = "";
                if (match)
                    downloadURL = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // updateURL
                match = header.match(/\/\/ @updateURL\b(.+)\s*/i);
                updateURL = "";
                if (match)
                    updateURL = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // optionsURL
                match = header.match(/\/\/ @optionsURL\b(.+)\s*/i);
                var optionsURL = "";
                if (match)
                    optionsURL = match.length > 0 ? match[1].replace(/^\s+/, "") : "";

                // fullDescription
                match = header.match(/\/\/ @note\b(.+)\s*/ig);
                fullDescription = "";
                var notes = [];
                if (match && match.length) {
                    for (var i = 0; i < match.length; i++) {
                        notes[i] = match[i].replace(/^\/\/ @note\s+/i, "");
                    }
                    fullDescription = "\n" + notes.join("\n");
                }

                var url = fph.getURLSpecFromFile(aFile);

                return {
                    filename: aFile.leafName,
                    file: aFile,
                    url: url,
                    charset: charset,
                    description: description,
                    version: version,
                    author: author,
                    namespace: namespace,
                    homepageURL: homepageURL,
                    reviewURL: reviewURL,
                    downloadURL: downloadURL,
                    optionsURL: optionsURL,
                    fullDescription: fullDescription,
                    isload: false,
                    shutdown: shutdown,
                    startup: startup,
                    regex: new RegExp("^" + exclude + "(" + (rex.include.join("|") || ".*") + ")$", "i")
                }
            }

            //加载脚本文件
            function readFile(aFile, metaOnly) {
                if (typeof metaOnly == 'undefined')
                    metaOnly = false;
                var stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
                stream.init(aFile, 0x01, 0, 0);
                var cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
                createInstance(Ci.nsIConverterInputStream);
                cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
                var content = "",
                    data = {};
                while (cvstream.readString(4096, data)) {
                    content += data.value;
                    if (metaOnly &&
                        content.indexOf('// ==/UserScript==') > 0)
                        break;
                }
                cvstream.close();
                return content.replace(/\r\n?/g, "\n");
            }

            //转换脚本文件的字符集
            function deleteBOMreadFile(aFile) {
                var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
                UI.charset = "UTF-8";
                var bytes = readBinary(aFile);
                try {
                    if (bytes.length > 3 && bytes.substring(0, 3) == String.fromCharCode(239, 187, 191)) {
                        aFile.copyTo(null, aFile.leafName + ".BOM");
                        bytes = bytes.substring(3, bytes.length);
                        writeFile(aFile, bytes);
                        return UI.ConvertToUnicode(bytes).replace(/\r\n?/g, "\n");
                    }
                    var charset = getCharset(bytes);
                    //window.userChrome_js.debug(aFile.leafName + " " +charset);
                    if (charset == "UTF-8" || charset == "us-ascii") {
                        return UI.ConvertToUnicode(bytes).replace(/\r\n?/g, "\n");
                    } else {
                        UI.charset = charset;
                        aFile.copyTo(null, aFile.leafName + "." + UI.charset);
                        bytes = UI.ConvertToUnicode(bytes);
                        UI.charset = "UTF-8";
                        writeFile(aFile, UI.ConvertFromUnicode(bytes));
                        return bytes.replace(/\r\n?/g, "\n");
                    }
                } catch (ex) {
                    return readFile(aFile);
                }
            }

            //二进制读取
            function readBinary(aFile) {
                var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance(Components.interfaces.nsIFileInputStream);
                istream.init(aFile, -1, -1, false);

                var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                    .createInstance(Components.interfaces.nsIBinaryInputStream);
                bstream.setInputStream(istream);
                return bstream.readBytes(bstream.available());
            }

            //二进制写入
            function writeFile(aFile, aData) {
                var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);
                // 注册文件时，使用 0x02 | 0x10
                foStream.init(aFile, 0x02 | 0x08 | 0x20, parseInt(664, 8), 0); // write, create, truncate
                foStream.write(aData, aData.length);
                foStream.close();
                return aData;
            }

            //获取字符集代码
            function getCharset(str) {
                function charCode(str) {
                    if (/\x1B\x24(?:[\x40\x42]|\x28\x44)/.test(str))
                        return 'ISO-2022-JP';
                    if (/[\x80-\xFE]/.test(str)) {
                        var buf = RegExp.lastMatch + RegExp.rightContext;
                        if (/[\xC2-\xFD][^\x80-\xBF]|[\xC2-\xDF][\x80-\xBF][^\x00-\x7F\xC2-\xFD]|[\xE0-\xEF][\x80-\xBF][\x80-\xBF][^\x00-\x7F\xC2-\xFD]/.test(buf))
                            return (/[\x80-\xA0]/.test(buf)) ? 'Shift_JIS' : 'EUC-JP';
                        if (/^(?:[\x00-\x7F\xA1-\xDF]|[\x81-\x9F\xE0-\xFC][\x40-\x7E\x80-\xFC])+$/.test(buf))
                            return 'Shift_JIS';
                        if (/[\x80-\xA0]/.test(buf))
                            return 'UTF-8';
                        return 'EUC-JP';
                    } else
                        return 'us-ascii';
                }

                var charset = charCode(str);
                if (charset == "UTF-8" || charset == "us-ascii")
                    return charset;

                //因有判断失败的情况，所以再次检查(迟钝);
                var UI = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
                try {
                    UI.charset = "UTF-8";
                    if (str === UI.ConvertFromUnicode(UI.ConvertToUnicode(str)))
                        return "UTF-8";
                } catch (ex) {}
                try {
                    UI.charset = charset;
                    if (str === UI.ConvertFromUnicode(UI.ConvertToUnicode(str)))
                        return charset;
                } catch (ex) {}
                return "UTF-8";
            }

            //pref读取
            function getPref(aPrefString, aPrefType, aDefault) {
                var xpPref = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefService);
                try {
                    switch (aPrefType) {
                        case 'complex':
                            return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile);
                            break;
                        case 'str':
                            return unescape(xpPref.getCharPref(aPrefString).toString());
                            break;
                        case 'int':
                            return xpPref.getIntPref(aPrefString);
                            break;
                        case 'bool':
                        default:
                            return xpPref.getBoolPref(aPrefString);
                            break;
                    }
                } catch (e) {}
                return aDefault;
            }

            //pref字符串变换
            function restoreState(a) {
                try {
                    var sd = [];
                    for (var i = 0, max = a.length; i < max; ++i) sd[unescape(a[i])] = true;
                    return sd;
                } catch (e) {
                    return [];
                }
            }
        },

        getLastModifiedTime: function(aScriptFile) {
            try {
                if (this.REPLACECACHE) {
                    var aLocalfile = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
                    aLocalfile.initWithPath(aScriptFile.path);
                    return aLocalfile.lastModifiedTime;
                }
                return aScriptFile.lastModifiedTime;
            } catch (e) {}
            return "";
        },

        //window.userChrome_js.loadOverlay
        shutdown: false,
        overlayWait: 0,
        overlayUrl: [],
        loadOverlay: function(url, observer, doc) {
            window.userChrome_js.overlayUrl.push([url, observer, doc]);
            if (!window.userChrome_js.overlayWait) window.userChrome_js.load(++window.userChrome_js.overlayWait);

        },

        load: function() {
            if (!window.userChrome_js.overlayUrl.length) return --window.userChrome_js.overlayWait;
            var [url, aObserver, doc] = this.overlayUrl.shift();
            if (!!aObserver && typeof aObserver == 'function') {
                aObserver.observe = aObserver;
            }
            if (!doc) doc = document;
            if (!(doc instanceof XULDocument))
                return 0;
            var observer = {
                observe: function(subject, topic, data) {
                    if (topic == 'xul-overlay-merged') {
                        //XXX 我们刚导致 localstore.rdf 要被重复应用 (bug 640158)
                        if ("retrieveToolbarIconsizesFromTheme" in window)
                            retrieveToolbarIconsizesFromTheme();
                        if (!!aObserver && typeof aObserver.observe == 'function') {
                            try {
                                aObserver.observe(subject, topic, data);
                            } catch (ex) {
                                window.userChrome_js.error(url, ex);
                            }
                        }
                        if ('userChrome_js' in window)
                            window.userChrome_js.load();
                    }
                },
                QueryInterface: function(aIID) {
                    if (!aIID.equals(Components.interfaces.nsISupports) &&
                        !aIID.equals(Components.interfaces.nsIObserver))
                        throw Components.results.NS_ERROR_NO_INTERFACE;
                    return this
                }
            };
            //if (this.INFO) this.debug("document.loadOverlay: " + url);
            try {
                if (window.userChrome_js.shutdown) return;
                doc.loadOverlay(url, observer);
            } catch (ex) {
                window.userChrome_js.error(url, ex);
            }
            return 0;
        },

        //xul读取
        runOverlays: function(doc) {
            try {
                var dochref = doc.location.href.replace(/#.*$/, "");
            } catch (e) {
                return;
            }

            var overlay;

            for (var m = 0, len = this.overlays.length; m < len; m++) {
                overlay = this.overlays[m];
                if (this.ALWAYSEXECUTE.indexOf(overlay.filename) < 0 &&
                    (!!this.dirDisable['*'] ||
                        !!this.dirDisable[overlay.dir] ||
                        !!this.scriptDisable[overlay.filename])) continue;

                // 决定是否运行脚本
                if (overlay.regex.test(dochref)) {
                    if (this.INFO) this.debug("loadOverlay: " + overlay.filename);
                    this.loadOverlay(overlay.url + "?" + this.getLastModifiedTime(overlay.file), null, doc);
                }
            }
        },

        //uc.js加载
        runScripts: function(doc) {
            try {
                var dochref = doc.location.href.replace(/#.*$/, "");
            } catch (e) {
                return;
            }
            if (!(doc instanceof XULDocument))
                return;

            var script, aScript, url;
            const Cc = Components.classes;
            const Ci = Components.interfaces;
            const maxJSVersion = (function getMaxJSVersion() {
                var appInfo = Components
                    .classes["@mozilla.org/xre/app-info;1"]
                    .getService(Components.interfaces.nsIXULAppInfo);
                var versionChecker = Components
                    .classes["@mozilla.org/xpcom/version-comparator;1"]
                    .getService(Components.interfaces.nsIVersionComparator);

                // Firefox 3.5 和更高版本支持 1.8.
                if (versionChecker.compare(appInfo.version, "3.5") >= 0) {
                    return "1.8";
                }
                // Firefox 2.0 和更高版本支持 1.7.
                if (versionChecker.compare(appInfo.version, "2.0") >= 0) {
                    return "1.7";
                }

                // 其它支持 1.6。
                return "1.6";
            })();

            for (var m = 0, len = this.scripts.length; m < len; m++) {
                script = this.scripts[m];
                if (this.ALWAYSEXECUTE.indexOf(script.filename) < 0 &&
                    (!!this.dirDisable['*'] ||
                        !!this.dirDisable[script.dir] ||
                        !!this.scriptDisable[script.filename])) continue;
                if (!script.regex.test(dochref)) continue;
                if (script.ucjs) { //for UCJS_loader
                    if (this.INFO) this.debug("loadUCJSSubScript: " + script.filename);
                    aScript = doc.createElementNS("http://www.w3.org/1999/xhtml", "script");
                    aScript.type = "application/javascript; version=" + maxJSVersion.toString().substr(0, 3);
                    aScript.src = script.url + "?" + this.getLastModifiedTime(script.file);
                    try {
                        doc.documentElement.appendChild(aScript);
                    } catch (ex) {
                        this.error(script.filename, ex);
                    }
                } else { //Not for UCJS_loader
                    if (this.INFO) this.debug("loadSubScript: " + script.filename);
                    try {
                        if (script.charset)
                            Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                            .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file),
                                doc.defaultView, script.charset);
                        else
                            Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                            .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file),
                                doc.defaultView, "UTF-8");
                    } catch (ex) {
                        this.error(script.filename, ex);
                    }
                }
            }
        },

        /**
         * 指定的版本号字符串和当前的 Gecko 的版本号进行比较
         * @param {String} aVersion 版本字符串(如 "1.8" "1.7.5")
         * @return {Number}
         * 实际版本与指定版本比较，如果较新时为 1、相同时为 0、较旧时为 -1
         * @see nsIVersionComparator
         * 例如在 Gecko 1.9.0 的环境中 geckoVersionCompare("1.9.1") 返回 1
         * 例如在 Gecko 1.9.0 的环境中 geckoVersionCompare("1.8.5") 则返回 -11
         */
        geckoVersionCompare: function ChaikaBrowser_geckoVersionCompare(aVersion) {
            var versionComparator = Cc["@mozilla.org/xpcom/version-comparator;1"]
                .getService(Ci.nsIVersionComparator);
            var appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
            return versionComparator.compare(aVersion, appInfo.platformVersion);
        },

        //以数字形式返回 Fx 的版本号，如 3.0、3.5 或 3.6 之类
        getVer: function() {
            var info = Components.classes["@mozilla.org/xre/app-info;1"]
                .getService(Components.interfaces.nsIXULAppInfo);
            var ver = parseInt(info.version.substr(0, 3) * 10, 10) / 10;
            return ver;
        },

        debug: function(aMsg) {
            Components.classes["@mozilla.org/consoleservice;1"]
                .getService(Components.interfaces.nsIConsoleService)
                .logStringMessage(aMsg);
        },

        error: function(aMsg, err) {
            const CONSOLE_SERVICE = Components.classes['@mozilla.org/consoleservice;1']
                .getService(Components.interfaces.nsIConsoleService);
            var error = Components.classes['@mozilla.org/scripterror;1']
                .createInstance(Components.interfaces.nsIScriptError);
            if (typeof(err) == 'object') error.init(aMsg + '\n' + err.name + ' : ' + err.message, err.fileName || null, null, err.lineNumber, null, 2, err.name);
            else error.init(aMsg + '\n' + err + '\n', null, null, null, null, 2, null);
            CONSOLE_SERVICE.logMessage(error);
        }
    };

    //为了稍微快一点，重复使用脚本数据
    var prefObj = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefService);
    try {
        var pref = prefObj.getBoolPref("userChrome.enable.reuse");
    } catch (e) {
        var pref = true;
    }


    var that = window.userChrome_js;
    window.addEventListener("unload", function() {
        that.shutdown = true;
    }, false);

    window.xxdebug = that.debug;
    //that.debug(typeof that.getScriptsDone);
    if (pref) {
        //现在的主窗口是否未曾在userChrome.js的脚本中进行初始化?
        if (!that.getScriptsDone) {
            //Firefox or Thunderbard?
            var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);
            if (mediator.getMostRecentWindow("navigator:browser"))
                var windowType = "navigator:browser";
            else if (mediator.getMostRecentWindow("mail:3pane"))
                var windowType = "mail:3pane";
            var enumerator = mediator.getEnumerator(windowType);
            //在主窗口内的其它内容呢?
            while (enumerator.hasMoreElements()) {
                var win = enumerator.getNext();
                //内部的主窗口是否未初始化?
                if (win.userChrome_js && win.userChrome_js.getScriptsDone) {
                    //对象可能会复制这个窗口
                    that.UCJS = win.userChrome_js.UCJS;
                    that.arrSubdir = win.userChrome_js.arrSubdir;
                    that.scripts = win.userChrome_js.scripts;
                    that.overlays = win.userChrome_js.overlays;
                    that.dirDisable = win.userChrome_js.dirDisable;
                    that.scriptDisable = win.userChrome_js.scriptDisable;
                    that.getScriptsDone = true;
                    break;
                }
            }
        }
    }

    if (!that.getScriptsDone) {
        if (that.INFO) that.debug("getScripts");
        that.getScripts();
        that.getScriptsDone = true;
    } else {
        if (that.INFO) that.debug("skip getScripts");
    }

    var href = location.href;
    var doc = document;

    //Bug 330458 在先前的覆盖层未完全加载前
    //无法使用 document.loadOverlay 动态的加载一个覆盖层

    if (that.INFO) that.debug("load " + href);

    //如果chromehidden未加载
    if (location.href === that.BROWSERCHROME &&
        that.EXCLUDE_CHROMEHIDDEN &&
        document.documentElement.getAttribute("chromehidden") != "")
        return;

    if (that.getVer() < 3) {
        setTimeout(function(doc) {
            that.runScripts(doc);
            setTimeout(function(doc) {
                that.runOverlays(doc);
            }, 0, doc);
        }, 0, doc);
    } else {
        if (!that.EXPERIMENT) {
            setTimeout(function(doc) {
                that.runScripts(doc);
                //因为麻烦，所以在 Firefox 3 的情况下先读取 editBookmarkOverlay.xul
                var delay = 800;
                /*
                if (location.href === that.BROWSERCHROME &&
                    typeof StarUI != 'undefined' && typeof StarUI._bookmarkPopupInitialized != 'boolean' &&
                    !(StarUI._overlayLoading || StarUI._overlayLoaded)) {
                  // xxxx bug 726440
                  StarUI._overlayLoading = true;
                  that.loadOverlay(
                    "chrome://browser/content/places/editBookmarkOverlay.xul",
                    (function (aSubject, aTopic, aData) {
                      //XXX We just caused localstore.rdf to be re-applied (bug 640158)
                      if ("retrieveToolbarIconsizesFromTheme" in window)
                        retrieveToolbarIconsizesFromTheme();

                      // Move the header (star, title, button) into the grid,
                      // so that it aligns nicely with the other items (bug 484022).
                      let header = this._element("editBookmarkPanelHeader");
                      let rows = this._element("editBookmarkPanelGrid").lastChild;
                      rows.insertBefore(header, rows.firstChild);
                      header.hidden = false;

                      this._overlayLoading = false;
                      this._overlayLoaded = true;
                      //this._doShowEditBookmarkPanel(aItemId, aAnchorElement, aPosition);
                    }).bind(StarUI)
                  );
                  delay = 0;
                }
                */
                setTimeout(function(doc) {
                    that.runOverlays(doc);
                }, delay, doc);
            }, 500, doc);
        } else {
            that.runScripts(doc);
            /*
            //因为麻烦，所以在 Firefox 3 的情况下先读取 editBookmarkOverlay.xul
            if (location.href === that.BROWSERCHROME &&
                typeof StarUI != 'undefined' &&
                !(StarUI._overlayLoading || StarUI._overlayLoaded)) {
              // xxxx bug 726440
              StarUI._overlayLoading = true;
              that.loadOverlay(
                "chrome://browser/content/places/editBookmarkOverlay.xul",
                (function (aSubject, aTopic, aData) {
                  //XXX We just caused localstore.rdf to be re-applied (bug 640158)
                  if ("retrieveToolbarIconsizesFromTheme" in window)
                    retrieveToolbarIconsizesFromTheme();

                  // Move the header (star, title, button) into the grid,
                  // so that it aligns nicely with the other items (bug 484022).
                  let header = this._element("editBookmarkPanelHeader");
                  let rows = this._element("editBookmarkPanelGrid").lastChild;
                  rows.insertBefore(header, rows.firstChild);
                  header.hidden = false;

                  this._overlayLoading = false;
                  this._overlayLoaded = true;
                  //this._doShowEditBookmarkPanel(aItemId, aAnchorElement, aPosition);
                }).bind(StarUI)
              );
            }
            */
            that.runOverlays(doc);
        }
    }
    //Sidebar for Trunc
    if (location.href != that.BROWSERCHROME) return;
    if (that.getVer() > 2) {
        window.document.addEventListener("load",
            function(event) {
                if (!event.originalTarget.location) return;
                if (/^(about:(blank|newtab|home))/i.test(event.originalTarget.location.href)) return;
                if (!/^(about:|chrome:)/.test(event.originalTarget.location.href)) return;
                var doc = event.originalTarget;
                var href = doc.location.href;
                if (that.INFO) that.debug("load Sidebar " + href);
                setTimeout(function(doc) {
                    that.runScripts(doc);
                    setTimeout(function(doc) {
                        that.runOverlays(doc);
                    }, 0, doc);
                }, 0, doc);
                if (href != "chrome://browser/content/web-panels.xul") return;
                if (!window.document.getElementById("sidebar")) return;
                var sidebarWindow = window.document.getElementById("sidebar").contentWindow;
                if (sidebarWindow) {
                    loadInWebpanel.init(sidebarWindow);
                }
            }, true);
    }
    var loadInWebpanel = {
        sidebarWindow: null,
        init: function(sidebarWindow) {
            this.sidebarWindow = sidebarWindow;
            this.sidebarWindow.document.getElementById("web-panels-browser").addEventListener("load", this, true);
            this.sidebarWindow.addEventListener("unload", this, false);
        },
        handleEvent: function(event) {
            switch (event.type) {
                case "unload":
                    this.uninit(event);
                    break;
                case "load":
                    this.load(event);
                    break;
            }
        },
        uninit: function(event) {
            this.sidebarWindow.document.getElementById("web-panels-browser").removeEventListener("load", this, true);
            this.sidebarWindow.removeEventListener("unload", this, false);
        },
        load: function(event) {
            var doc = event.originalTarget;
            var href = doc.location.href;
            if (!/^chrome:/.test(href)) return;
            if (that.INFO) that.debug("load Webpanel " + href);
            setTimeout(function(doc) {
                that.runScripts(doc);
                setTimeout(function(doc) {
                    that.runOverlays(doc);
                }, 0, doc);
            }, 0, doc);
        }
    }
})();