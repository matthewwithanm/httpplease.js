/*globals chai, httpplease, httppleaseplugins, describe, it */
'use strict';

var
    assert = chai.assert,
    http = httpplease,
    plugins = httppleaseplugins,
    testServerUrl = 'http://localhost:4001';


describe('httpplease', function () {
    it('performs a get request', function (done) {
        http.get(testServerUrl + '/getjson', function (err, res) {
            assert.equal(res.text, JSON.stringify({
                hello: 'world'
            }));
            done();
        });
    });
    it('identifies errors', function (done) {
        http.get(testServerUrl + '/404', function (err, res) {
            assert.equal(err.status, 404);
            assert(err.isHttpError);
            done();
        });
    });
    it('obeys the errorOn404 option', function (done) {
        http.get({
            url: testServerUrl + '/404',
            errorOn404: false
        }, function (err, res) {
            assert.isUndefined(err);
            assert(res.isHttpError);
            done();
        });
    });
    it('sends headers', function (done) {
        var req;
        req = {
            url: testServerUrl + '/headers',
            headers: {
                hello: 'world'
            }
        };
        http.get(req, function (err, res) {
            var json;
            json = JSON.parse(res.text);
            assert.equal(json.hello, 'world');
            done();
        });
    });
    describe('defaults', function () {
        it('adds defaults', function () {
            assert.equal(http.defaults({
                dummy: 5
            }).defaults().dummy, 5);
        });
        it("doesn't mutate the http function", function () {
            http.defaults({
                dummy: 5
            });
            assert.isUndefined(http.defaults().dummy);
        });
    });
    describe('use', function () {
        it('adds a plugin', function () {
            var startCount;
            startCount = http.plugins().length;
            assert.equal(http.use({}).plugins().length, startCount + 1);
        });
        it("doesn't mutate the http function", function () {
            var startCount;
            startCount = http.plugins().length;
            http.use({});
            assert.equal(http.plugins().length, startCount);
        });
    });
    describe('bare', function () {
        it('creates a http function without plugins', function () {
            assert.equal(http.use({}).bare().plugins().length, 0);
        });
    });
});

describe('plugins', function () {
    describe('jsonparser', function () {
        it('is used for error responses', function (done) {
            http.use(plugins.jsonparser).get(testServerUrl + '/404', function (err, res) {
                assert.deepEqual(err.body, {
                    sad: 'panda'
                });
                done();
            });
        });
        it('parses json responses', function (done) {
            http.use(plugins.jsonparser).get(testServerUrl + '/getjson', function (err, res) {
                assert.deepEqual(res.body, {
                    hello: 'world'
                });
                done();
            });
        });
        function parseWithContentType(ct, isJsonType) {
            var res;
            if (isJsonType == null) {
                isJsonType = true;
            }
            res = {
                contentType: ct,
                body: '{"hello": "world"}'
            };
            plugins.jsonparser.processResponse(res);
            if (isJsonType) {
                assert.deepEqual(res.body, {
                    hello: 'world'
                });
            } else {
                assert.equal(res.body, '{"hello": "world"}');
            }
        }
        it('honors the content type', function () {
            parseWithContentType('application/json');
            parseWithContentType('text/json');
            parseWithContentType('text/json');
            parseWithContentType('text/something+json');
            parseWithContentType('application/json; charset=utf-8');
            parseWithContentType('application/jsonp', false);
        });
    });
    describe('jsonrequest', function () {
        it('formats the request', function () {
            var req;
            req = new http.Request({
                body: {
                    hello: 'world'
                }
            });
            plugins.jsonrequest.processRequest(req);
            assert.equal(req.body, '{"hello":"world"}');
            assert.equal(req.header('Content-Type'), 'application/json');
        });
    });
});
