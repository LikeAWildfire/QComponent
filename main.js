/**
 * Created by zibx on 15.07.16.
 */
var http = require('http'), url = require('url'), fs = require('fs'),
    Core = require('./Core'),
    debug = process.env.debug || true,
    Path = require('path'),
    querystring = require('querystring'),
    descriptor = require('./Core/Descriptor');

var header = '<!DOCTYPE HTML>' +
    '<html><head>' +
    '<meta charset="utf-8">' +
    '<meta name="referrer" content="no-referrer">' +
    '<script>module = {};</script>' +

    '<script src="bundle.js"></script>' +
    '<link rel="stylesheet" type="text/css" href="qstyle.css">' +
    '<link rel="stylesheet" type="text/css" href="highlight.css">' +
    '</head><body>';
var headerLight =
    '<!DOCTYPE HTML>' +
    '<html><head>' +
    '<meta charset="utf-8">' +
    '<meta name="referrer" content="no-referrer">' +
    '<link rel="stylesheet" type="text/css" href="/qstyle.css">' +
    '<link rel="stylesheet" type="text/css" href="/highlight.css">' +
    '</head><body>';
var footer = '</body></html>';

function fsExists(path) {
    try {
        return fs.statSync(path);
    } catch (e) {
        return false;
    }
}

function serveStatic(path) {
    try {
        return fs.readFileSync(path);
    } catch (e) {
        return '';
    }
}

var server = http.createServer(function (req, res) {


    if (req.method === 'POST') {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            console.log(body)
            doIt(req, res, body, 'compile.qs');
        });
        return;
    }

    if (req.url.indexOf('/describe') === 0) {

        var parts = req.url.split('/');

        if (parts.length > 2)
            return res.end(headerLight + descriptor.describeComponent(parts[2]) + footer);
        else
            return res.end(headerLight + descriptor.makeBase() + footer);
    }

    doIt(req, res);
});


var doIt = function (req, res, source, path) {

    var reqUrl = url.parse(req.url, true);
    if (!source)
        try {

            path = 'public/' + reqUrl.pathname.substring(1);

            if (path.indexOf('css') !== -1 || path.indexOf('js') !== -1) {
                return res.end(serveStatic(path));
            }

            var s = fsExists(path);
            if (s && !s.isDirectory()) {
                source = fs.readFileSync(path, 'binary');
            } else {
                var entries = fs.readdirSync(path);

                var out = [];

                var json = reqUrl.query.json;

                if (json) {

                    for (var i = 0; i < entries.length; i++) {
                        var cEntry = entries[i];
                        var stat = fs.statSync(Path.join(path, cEntry));

                        out.push({
                            name: cEntry,
                            type: stat.isDirectory() ? 'directory' : 'file'
                        })
                    }

                    res.end(JSON.stringify(out));

                } else {

                    for (var i = 0; i < entries.length; i++) {
                        var cEntry = entries[i];
                        var stat = fs.statSync(Path.join(path, cEntry));
                        if (!stat.isDirectory() && cEntry.indexOf('.qs') !== -1) {
                            out.push({ key: cEntry.toLowerCase(), html: '<div style="clear: both;"><a style="display: block; float: left; width: 200px;" href="/' + cEntry + '">' + cEntry + '</a><a style="float: left; display: block; width: 650px;" href="/' + cEntry + '?highlight=true">View code</a></div>' });
                        }
                    }

                    return res.end(header +
                        out
                            .sort(function (a, b) { return a.key > b.key ? 1 : a.key < b.key ? -1 : 0; })
                            .map(function (el) { return el.html; })
                            .join('\n') +
                        footer);
                }
            }


            if (path.indexOf('.qs') === -1)
                return res.end(source, 'binary');
            source = fs.readFileSync(path) + '';

            console.log('file exists. it`s qs!');
        } catch (e) {
            return res.end('No file (' + path + ')');
        }
    var p = new Core.Compile.Linker({
        mapping: {
            id: 'id',
            code: 'code'
        }
    });
    try {
        var obj = p.add({
            id: path,
            code: source
        });
        console.log('source added');
        try {
            var meta = p.getMetadata(),
                subObj = {},
                compiled;
            console.log('metadata extracted');
            for (var i in meta) {
                meta[i] && meta[i].type && (subObj[i] = meta[i]);
            }

            if (!reqUrl.query.highlight) {
                compiled = Core.Compile.Compiler.compile(subObj);

                return res.end(header +
                    '<script>console.log("INIT");QObject = Base.QObject; Q = ' + compiled + ';</script></head><body><script>var c=new Q.main();c.load();</script>' +
                    footer);
            } else {

                source = source
                    .replace(/\r\n/g, "\n")
                    .replace(/>/g, "&gt;")
                    .replace(/</g, "&lt;");

                for (var i = 0; i < obj.tokens.length; i++) {
                    var cToken = obj.tokens[i];
                    for (var j = 0; j < cToken.items.length; j++) {
                        var cItem = cToken.items[j];

                        switch (cItem.type) {
                            case 'comment':
                                source = source.replace(cItem.data, '<span class="comment">' + cItem.data + '</span>');
                                break;
                        }
                    }
                }

                for (var key in meta)
                    if (meta.hasOwnProperty(key)) {
                        var cType = meta[key];
                        if (cType.type) {
                            source = source.replace(new RegExp(' ' + key + '', 'g'), '<span class="new_cls">$&</span>');
                        } else {
                            source = source.replace(new RegExp(' ' + key + '', 'g'), '<span class="cls">$&</span>');
                        }

                        for (var p in cType.public)
                            if (cType.public.hasOwnProperty(p)) {
                                var cPub = cType.public[p];
                                source = source.replace(new RegExp(' ' + p + '.', 'g'), '<span class="property">$&</span>');
                            }
                        for (var pr in cType.private)
                            if (cType.private.hasOwnProperty(pr)) {
                                var cPriv = cType.private[pr];

                                source = source.replace(new RegExp('' + pr + '', 'g'), '<span class="property">$&</span>');
                            }
                    }

                source = source.replace(/\n/g, "<br/>\n");
                source = source.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                source = source.replace(/ (?![^<]*>)/g, "&nbsp");
                source = source.replace(/(def|define|public)/g, '<span class="keyword">$&</span>');
                var x = 1,
                    lines = source.split('\n');

                return res.end(header + '<span class="highlight">' + lines.map(function (i) {
                    return new Array((lines.length + '').length + 1 - (x + '').length).join('0') + x++ + '&nbsp;' + i;
                }).join('\n') + '</span><script src="highlight.js"></script></body></html>');
            }

        } catch (e) {
            if (debug) throw e;
            return res.end(e.message);
        }
    } catch (e) {
        return res.end(e.stack);
    }
};

var port = 8001;
server.listen(port, '0.0.0.0', function (err) {
    console.log('listen on ' + port);
});