var cleanURL = require('./plugins/cleanurl');
var XHR = require('./xhr');
var delay = require('./delay');
var createError = require('./error').create;
var Response = require('./response');
var Request = require('./request');
var extend = require('xtend');
var once = require('once');

function factory(defaults, plugins) {
  defaults = defaults || {};
  plugins = plugins || [];

  function http(req, cb) {
    var xhr, plugin, i, done, k, v;

    req = new Request(extend(defaults, req));

    for (i = 0; i < plugins.length; i++) {
      plugin = plugins[i];
      if (plugin.createXHR) {
        xhr = plugin.createXHR(req);
        break;
      }
    }
    xhr = xhr || new XHR;

    done = once(delay(function(err) {
      xhr.onload = xhr.onerror = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null;
      var res = err && err.isHttpError ? err : new Response(req);
      for (i = 0; i < plugins.length; i++) {
        plugin = plugins[i];
        if (plugin.processResponse) {
          plugin.processResponse(res);
        }
      }
      cb(err, res);
    }));

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var type = Math.floor(xhr.status / 100);
        if (type === 2) {
          done();
        } else if (xhr.status === 404 && !req.errorOn404) {
          done();
        } else if (type === 4) {
          done(createError('Client Error', req));
        } else if (type === 5) {
          done(createError('Server Error', req));
        } else {
          done(createError('HTTP Error', req));
        }
      }
    };

    xhr.onload = function() { done(); };

    xhr.onerror = function() {
      done(createError('Internal XHR Error', req));
    };

    xhr.ontimeout = function() {};

    xhr.onprogress = function() {};

    req.xhr = xhr;

    for (i = 0; i < plugins.length; i++) {
      plugin = plugins[i];
      if (plugin.processRequest) {
        plugin.processRequest(req);
      }
    }

    xhr.open(req.method, req.url);

    for (k in req.headers) {
      if (!req.headers.hasOwnProperty(k)) { continue; }
      xhr.setRequestHeader(k, req.headers[k]);
    }

    xhr.send(req.body);

    return req;
  };

  var methods = ['get', 'post', 'put', 'head', 'patch', 'delete'];
  for (i = 0; i < methods.length; i++) {
    var method = methods[i];
    http[method] = (function(method) {
      return function(req, cb) {
        req = new Request(req);
        req.method = method;
        return http(req, cb);
      };
    }(method));
  }

  http.plugins = function() {
    return plugins;
  };

  http.defaults = function(newValues) {
    if (newValues) {
      return factory(extend(defaults, newValues), plugins);
    } else {
      return defaults;
    }
  };

  http.use = function() {
    var newPlugins = Array.prototype.slice.call(arguments, 0);
    return factory(defaults, plugins.concat(newPlugins));
  };

  http.bare = function() {
    return factory();
  };

  http.Request = Request;
  http.Response = Response;

  return http;
};

module.exports = factory({}, [cleanURL]);
