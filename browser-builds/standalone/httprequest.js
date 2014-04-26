!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.httprequest=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function() {
  var Response;

  module.exports = Response = (function() {
    function Response(xhr) {
      this.xhr = xhr;
      this.status = xhr.status || 0;
      this.text = xhr.responseText;
    }

    return Response;

  })();

}).call(this);

},{}],2:[function(_dereq_,module,exports){
(function() {
  var createXHR, urllite;

  urllite = _dereq_('urllite/lib/core');

  createXHR = function(src) {
    var XDR, XHR, a, b, xhr;
    if (typeof window === "undefined" || window === null) {
      return null;
    }
    if (XHR = window.XMLHttpRequest) {
      xhr = new XHR;
      if ('withCredentials' in xhr) {
        return xhr;
      }
    }
    if (XDR = window.XDomainRequest) {
      a = urllite(src);
      b = urllite(window.location.href);
      if (!a.host) {
        return xhr;
      }
      if (a.protocol === b.protocol && a.host === b.host && a.port === b.port) {
        return xhr;
      }
      return new XDR;
    }
    return xhr;
  };

  module.exports = createXHR;

}).call(this);

},{"urllite/lib/core":7}],3:[function(_dereq_,module,exports){
(function() {
  var delay,
    __slice = [].slice;

  delay = function(fn) {
    return function() {
      var args, newFunc;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      newFunc = function() {
        return fn.apply(null, args);
      };
      setTimeout(newFunc, 0);
    };
  };

  module.exports = delay;

}).call(this);

},{}],4:[function(_dereq_,module,exports){
(function() {
  var HttpError, createError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HttpError = (function(_super) {
    __extends(HttpError, _super);

    HttpError.prototype.name = 'HttpError';

    function HttpError(message) {
      this.message = message;
    }

    return HttpError;

  })(Error);

  createError = function(message, xhr) {
    var err;
    err = new HttpError(message);
    err.status = xhr.status || 0;
    err.xhr = xhr;
    return err;
  };

  module.exports = {
    HttpError: HttpError,
    createError: createError
  };

}).call(this);

},{}],5:[function(_dereq_,module,exports){
(function() {
  var Response, createError, createXHR, delay, extend, method, once, parseOpts, request, _fn, _i, _len, _ref;

  createXHR = _dereq_('./createXHR');

  createError = _dereq_('./errors').createError;

  Response = _dereq_('./Response');

  once = _dereq_('once');

  delay = _dereq_('./delay');

  extend = _dereq_('xtend');

  parseOpts = function(optsOrUrl) {
    var defaults, opts;
    opts = typeof optsOrUrl === 'string' ? {
      url: optsOrUrl
    } : optsOrUrl;
    defaults = {
      method: 'GET'
    };
    opts = extend(defaults, opts);
    opts.method = opts.method.toUpperCase();
    opts.url = opts.url;
    return opts;
  };

  request = function(optsOrUrl, cb) {
    var done, opts, xhr;
    opts = parseOpts(optsOrUrl);
    xhr = createXHR(opts.url);
    done = once(delay(function(err) {
      xhr.onload = xhr.onerror = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null;
      return cb(err, err ? null : new Response(xhr));
    }));
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        switch (xhr.status.toString().slice(0, 1)) {
          case '2':
            return done();
          case '4':
            return done(createError('Client Error', xhr));
          case '5':
            return done(createError('Server Error', xhr));
          default:
            return done(createError('HTTP Error', xhr));
        }
      }
    };
    xhr.onload = function() {
      return done();
    };
    xhr.onerror = function() {
      return done(createError('Internal XHR Error', xhr));
    };
    xhr.ontimeout = function() {};
    xhr.onprogress = function() {};
    xhr.open(opts.method, opts.url.replace(/[^%]+/g, function(s) {
      return encodeURI(s);
    }));
    return xhr.send();
  };

  _ref = ['get', 'post', 'put', 'head', 'patch', 'delete'];
  _fn = function(method) {
    return request[method] = function(optsOrUrl, cb) {
      var opts;
      opts = extend(parseOpts(optsOrUrl), {
        method: method
      });
      return request(opts, cb);
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    method = _ref[_i];
    _fn(method);
  }

  module.exports = request;

}).call(this);

},{"./Response":1,"./createXHR":2,"./delay":3,"./errors":4,"once":6,"xtend":8}],6:[function(_dereq_,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

},{}],7:[function(_dereq_,module,exports){
(function() {
  var URL, URL_PATTERN, defaults, urllite,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  URL_PATTERN = /^(?:(?:([^:\/?\#]+:)\/+|(\/\/))(?:([a-z0-9-\._~%]+)(?::([a-z0-9-\._~%]+))?@)?(([a-z0-9-\._~%!$&'()*+,;=]+)(?::([0-9]+))?)?)?([^?\#]*?)(\?[^\#]*)?(\#.*)?$/;

  urllite = function(raw, opts) {
    return urllite.URL.parse(raw, opts);
  };

  urllite.URL = URL = (function() {
    function URL(props) {
      var k, v;
      for (k in props) {
        if (!__hasProp.call(props, k)) continue;
        v = props[k];
        this[k] = v;
      }
    }

    URL.parse = function(raw) {
      var m, pathname, protocol;
      m = raw.toString().match(URL_PATTERN);
      pathname = m[8] || '';
      protocol = m[1];
      return urllite._createURL({
        protocol: protocol,
        username: m[3],
        password: m[4],
        hostname: m[6],
        port: m[7],
        pathname: protocol && pathname.charAt(0) !== '/' ? "/" + pathname : pathname,
        search: m[9],
        hash: m[10],
        isSchemeRelative: m[2] != null
      });
    };

    return URL;

  })();

  defaults = {
    protocol: '',
    username: '',
    password: '',
    host: '',
    hostname: '',
    port: '',
    pathname: '',
    search: '',
    hash: '',
    origin: '',
    isSchemeRelative: false
  };

  urllite._createURL = function() {
    var base, bases, k, props, v, _i, _len, _ref, _ref1;
    bases = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    props = {};
    for (_i = 0, _len = bases.length; _i < _len; _i++) {
      base = bases[_i];
      for (k in defaults) {
        if (!__hasProp.call(defaults, k)) continue;
        v = defaults[k];
        props[k] = (_ref = (_ref1 = base[k]) != null ? _ref1 : props[k]) != null ? _ref : v;
      }
    }
    props.host = props.hostname && props.port ? "" + props.hostname + ":" + props.port : props.hostname ? props.hostname : '';
    props.origin = props.protocol ? "" + props.protocol + "//" + props.host : '';
    props.isAbsolutePathRelative = !props.host && props.pathname.charAt(0) === '/';
    props.isPathRelative = !props.host && props.pathname.charAt(0) !== '/';
    props.isRelative = props.isSchemeRelative || props.isAbsolutePathRelative || props.isPathRelative;
    props.isAbsolute = !props.isRelative;
    return new urllite.URL(props);
  };

  module.exports = urllite;

}).call(this);

},{}],8:[function(_dereq_,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[5])
(5)
});