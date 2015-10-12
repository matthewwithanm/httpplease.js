/*globals chai, httpplease, httppleaseplugins, describe, it */
'use strict';

var
  assert = chai.assert,
  http = httpplease,
  plugins = httppleaseplugins,
  testServerUrl = 'http://localhost:4001';


describe('httpplease', function() {
  it('performs a get request', function(done) {
    http.get(testServerUrl + '/getjson', function(err, res) {
      if (err) return done(err);
      assert.equal(res.text, JSON.stringify({
        hello: 'world'
      }));
      done();
    });
  });
  it('calls onload', function(done) {
    http.get({
      url: testServerUrl + '/getjson',
      onload: function(res) {
        assert.equal(res.text, JSON.stringify({
          hello: 'world'
        }));
        done();
      }
    });
  });
  it('puts the request and xhr on the response', function(done) {
    http.get(testServerUrl + '/getjson', function(err, res) {
      if (err) return done(err);
      assert.property(res, 'request');
      assert.property(res, 'xhr');
      done();
    });
  });
  it('identifies errors', function(done) {
    http.get(testServerUrl + '/404', function(err) {
      assert.equal(err.status, 404);
      assert(err.isHttpError);
      done();
    });
  });
  it("doesn't pass responses when there are errors", function(done) {
    http.get(testServerUrl + '/404', function(err, res) {
      assert.ok(err);
      assert.isUndefined(res);
      done();
    });
  });
  it('calls onerror', function(done) {
    http.get({
      url: testServerUrl + '/404',
      onerror: function(err) {
        assert.equal(err.status, 404);
        assert(err.isHttpError);
        done();
      }
    });
  });
  it('obeys the errorOn404 option', function(done) {
    http.get({
      url: testServerUrl + '/404',
      errorOn404: false
    }, function(err, res) {
      assert.isUndefined(err);
      assert(res.isHttpError);
      done();
    });
  });
  it('obeys the timeout option', function(done) {
    http.get({
      // Use a query param to make sure we're not loading from the cache.
      url: testServerUrl + '/slow?' + new Date().getTime(),
      timeout: 1
    }, function(err) {
      assert.equal(err && err.name, 'Timeout');
      done();
    });
  });
  it('sends headers', function(done) {
    var req;
    req = {
      url: testServerUrl + '/headers',
      headers: {
        hello: 'world'
      }
    };
    http.get(req, function(err, res) {
      if (err) return done(err);
      var json;
      json = JSON.parse(res.text);
      assert.equal(json.hello, 'world');
      done();
    });
  });
  it('parses headers', function(done) {
    var req;
    req = {url: testServerUrl + '/getjson'};
    http.get(req, function(err, res) {
      if (err) return done(err);
      assert.equal(res.headers['content-type'], 'application/json');
      done();
    });
  });
  describe('abort', function() {
    it('cancels requests', function(done) {
      http
        .get(testServerUrl + '/getjson', function(err) {
          assert.equal(err && err.name, 'Abort');
          assert(err.request && err.request.aborted);
          done();
        })
        .abort();
    });
  });
  describe('defaults', function() {
    it('adds defaults', function() {
      assert.equal(http.defaults({
        dummy: 5
      }).defaults().dummy, 5);
    });
    it("doesn't mutate the http function", function() {
      http.defaults({
        dummy: 5
      });
      assert.isUndefined(http.defaults().dummy);
    });
  });
  describe('use', function() {
    it('adds a plugin', function() {
      var startCount;
      startCount = http.plugins().length;
      assert.equal(http.use({}).plugins().length, startCount + 1);
    });
    it("doesn't mutate the http function", function() {
      var startCount;
      startCount = http.plugins().length;
      http.use({});
      assert.equal(http.plugins().length, startCount);
    });
  });
  describe('bare', function() {
    it('creates a http function without plugins', function() {
      assert.equal(http.use({}).bare().plugins().length, 0);
    });
  });
});

describe('RequestError', function() {

  it('has the correct constructor', function() {
    var error = new httpplease.RequestError('test');
    assert.equal(error.constructor.prototype.constructor, httpplease.RequestError);
  });

});

describe('plugin', function() {

  describe('createXHR', function() {
    function createXHR() {
      return {open: function() {}, send: function() {}};
    }

    it('can provide an object that is used for requests', function() {
      var xhr = createXHR();
      var req = http
        .use({createXHR: function() { return xhr; }})
        .get(testServerUrl + '/404');
      assert.equal(req.xhr, xhr);
    });

    it('is treated on a first-come-first-serve basis', function() {
      var xhr1 = createXHR();
      var xhr2 = createXHR();
      var req = http
        .use({createXHR: function() { return xhr1; }})
        .use({createXHR: function() { return xhr2; }})
        .get(testServerUrl + '/404');
      assert.equal(req.xhr, xhr1);
    });

  });

  describe('processRequest', function() {

    it('is given the request object to process', function() {
      var thingProcessRequestGot;
      var req = http
        .use({processRequest: function(value) { thingProcessRequestGot = value; }})
        .get(testServerUrl + '/404');
      assert.equal(req, thingProcessRequestGot);
    });

    it('is executed in series', function() {
      var callOrder = [];
      http
        .use({processRequest: function() { callOrder.push(1); }})
        .use({processRequest: function() { callOrder.push(2); }})
        .get(testServerUrl + '/404');
      assert.deepEqual(callOrder, [1, 2]);
    });

  });

  describe('processResponse', function() {

    it('is given the response object to process', function(done) {
      var thingProcessResponseGot;
      http
        .use({processResponse: function(value) { thingProcessResponseGot = value; }})
        .get(testServerUrl + '/404', function(err) {
          assert.equal(err, thingProcessResponseGot);
          done();
        });
    });

    it('can return a function for continuation', function(done) {
      var argsPassedToThunk;
      var thingHandedBackFromThunk = {};
      http
        .use({processResponse: function() {
          return function(cb, req, send) {
            argsPassedToThunk = [cb, req, send];
            cb(thingHandedBackFromThunk);
          };
        }})
        .get(testServerUrl + '/404', function(_, res) {
          assert.isFunction(argsPassedToThunk[0]);
          assert.instanceOf(argsPassedToThunk[1], httpplease.Request);
          assert.isFunction(argsPassedToThunk[2]);
          assert.equal(res, thingHandedBackFromThunk);
          done();
        });
    });

    it('can resend a request', function(done) {
      var theReq, responses = [];

      http
        .use({processResponse: function(res) {
          responses.push(res);
          return function(cb, req, send) {
            req.tries = req.tries ? req.tries + 1 : 1;
            theReq = req;
            if (req.tries < 2) send(req, cb);
            else cb(res);
          };
        }})
        .get(testServerUrl + '/404', function(err) {
          assert.equal(theReq.tries, 2);
          assert.instanceOf(theReq, httpplease.Request);
          assert.notEqual(responses[0], err);
          assert.equal(responses[1], err);
          done();
        });

    });

    it('is executed in series', function(done) {
      var callOrder = [];
      http
        .use({processResponse: function() { callOrder.push(1); }})
        .use({processResponse: function() { callOrder.push(2); }})
        .get(testServerUrl + '/404', function() {
          assert.deepEqual(callOrder, [1, 2]);
          done();
        });
    });

  });

});

describe('plugins', function() {
  describe('jsonresponse', function() {
    it('adds an Accept header', function() {
      var req = new http.Request();
      plugins.jsonresponse.processRequest(req);
      assert.equal(req.header('Accept'), 'application/json');
    });
    it('is used for error responses', function(done) {
      http.use(plugins.jsonresponse).get(testServerUrl + '/404', function(err) {
        assert.deepEqual(err.body, {
          sad: 'panda'
        });
        done();
      });
    });
    it('parses json responses', function(done) {
      http.use(plugins.jsonresponse).get(testServerUrl + '/getjson', function(err, res) {
        if (err) return done(err);
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
      plugins.jsonresponse.processResponse(res);
      if (isJsonType) {
        assert.deepEqual(res.body, {
          hello: 'world'
        });
      } else {
        assert.equal(res.body, '{"hello": "world"}');
      }
    }
    it('honors the content type', function() {
      parseWithContentType('application/json');
      parseWithContentType('text/json');
      parseWithContentType('text/json');
      parseWithContentType('text/something+json');
      parseWithContentType('application/json; charset=utf-8');
      parseWithContentType('application/jsonp', false);
    });
  });
  describe('jsonrequest', function() {
    it("adds a Content-Type header if there's a body", function() {
      var req = new http.Request();
      req.body = {hello: 'world'};
      plugins.jsonrequest.processRequest(req);
      assert.equal(req.header('Content-Type'), 'application/json');
    });
    it("doesn't add a Content-Type header if there's no body", function() {
      var req = new http.Request();
      plugins.jsonrequest.processRequest(req);
      assert.isUndefined(req.header('Content-Type'));
    });
    it('formats the request', function() {
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
  describe('setprotocol', function() {
    var currentProtocol = typeof window === 'undefined' ? 'http:' : window.location.protocol,
      otherProtocol = currentProtocol === 'http:' ? 'https:' : 'http:';

    it('uses http by default', function() {
      var req = new http.Request('//example.com/');
      plugins.setprotocol.processRequest(req);
      assert.equal(req.url, 'http://example.com/');
    });
    it('can be invoked to provide options', function() {
      var req = new http.Request('//example.com/');
      plugins
        .setprotocol({defaultProtocol: currentProtocol})
        .processRequest(req);
      assert.equal(req.url, currentProtocol + '//example.com/');
    });
    it('can override protocols', function() {
      var req = new http.Request(otherProtocol + '//example.com/');
      plugins
        .setprotocol({defaultProtocol: currentProtocol, override: true})
        .processRequest(req);
      assert.equal(req.url, currentProtocol + '//example.com/');
    });
  });
});
