'use strict';

var
  cleanURL = require('../plugins/cleanurl'),
  XHR = require('./xhr'),
  delay = require('./utils/delay'),
  RequestError = require('./error'),
  Response = require('./response'),
  Request = require('./request'),
  extend = require('xtend'),
  once = require('./utils/once');

var i,
    createError = RequestError.create;

function factory(defaults, plugins) {
  plugins = plugins || [];

  function http(req, cb) {
    var done, xhr;

    // Use a single completion callback.
    done = once(delay(function(err, res) {
      // Invoke callbacks
      if (err && req.onerror) req.onerror(err);
      if (!err && req.onload) req.onload(res);
      if (cb) cb(err, err ? undefined : res);
    }));

    req = createAndProcessRequest(plugins, req, defaults);
    xhr = createXHR(plugins, req);
    req.xhr = xhr;
    sendAndProcessResponse(plugins, req, done);

    return req;
  }

  var method,
    methods = ['get', 'post', 'put', 'head', 'patch', 'delete'],
    verb = function(method) {
      return function(req, cb) {
        req = new Request(req);
        req.method = method;
        return http(req, cb);
      };
    };
  for (i = 0; i < methods.length; i++) {
    method = methods[i];
    http[method] = verb(method);
  }

  http.plugins = function() {
    return plugins;
  };

  http.defaults = function(newValues) {
    if (newValues) {
      return factory(extend(defaults, newValues), plugins);
    }
    return defaults;
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
  http.RequestError = RequestError;

  return http;
}

module.exports = factory({}, [cleanURL]);

/**
 * Analyze the request to see if it represents an error. If so, return it! An
 * original error object can be passed as a hint.
 */
function getError(req, err) {
  if (req.aborted) return createError('Request aborted', req, {name: 'Abort'});

  if (req.timedOut) return createError('Request timeout', req, {name: 'Timeout'});

  var xhr = req.xhr;
  var type = Math.floor(xhr.status / 100);

  var kind;
  switch (type) {
    case 0:
    case 2:
      // These don't represent errors unless the function was passed an
      // error object explicitly.
      if (!err) return;
      return createError(err.message, req);
    case 4:
      // Sometimes 4XX statuses aren't errors.
      if (xhr.status === 404 && !req.errorOn404) return;
      kind = 'Client';
      break;
    case 5:
      kind = 'Server';
      break;
    default:
      kind = 'HTTP';
  }
  var msg = kind + ' Error: ' +
        'The server returned a status of ' + xhr.status +
        ' for the request "' +
        req.method.toUpperCase() + ' ' + req.url + '"';
  return createError(msg, req);
}

/**
 * Create and process a request.
 */
function createAndProcessRequest(plugins, req, defaults) {
  defaults = defaults || {};
  req = new Request(extend(defaults, req));
  return processRequest(plugins, req);
}

/**
 * Run plugin processors on the request in series.
 */
function processRequest(plugins, req) {
  var plugin;

  for (i = 0; i < plugins.length; i++) {
    plugin = plugins[i];
    if (plugin.processRequest) {
      plugin.processRequest(req);
    }
  }

  return req;
}

/**
 * Create the XHR object.
 */
function createXHR(plugins, req) {
  var plugin, xhr;

  // Give the plugins a chance to create the XHR object
  for (i = 0; i < plugins.length; i++) {
    plugin = plugins[i];
    if (plugin.createXHR) {
      xhr = plugin.createXHR(req);
      break; // First come, first serve
    }
  }
  xhr = xhr || new XHR();

  return xhr;
}

/**
 * Send the request and process the response.
 */
function sendAndProcessResponse(plugins, req, done) {
  var k, err, res, plugin, timeoutId, checkIfDone, supportsLoadAndErrorEvents,
      xhr = req.xhr;

  // This can be called with or without an error. If no error is passed, the
  // request will be examined to see if it was successful.
  checkIfDone = function(rawError) {
    clearTimeout(timeoutId);
    xhr.onload = xhr.onerror = xhr.onabort = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null;

    err = getError(req, rawError);

    res = err || Response.fromRequest(req);
    res = processResponse(plugins, res);

    done(err, res);
  };

  supportsLoadAndErrorEvents = ('onload' in xhr) && ('onerror' in xhr);
  xhr.onload = function() { checkIfDone(); };
  xhr.onerror = checkIfDone;
  xhr.onabort = function() { checkIfDone(); };

  // We'd rather use `onload`, `onerror`, and `onabort` since they're the
  // only way to reliably detect successes and failures but, if they
  // aren't available, we fall back to using `onreadystatechange`.
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    if (req.aborted) return checkIfDone();

    if (!supportsLoadAndErrorEvents) {
      // Assume a status of 0 is an error. This could be a false
      // positive, but there's no way to tell when using
      // `onreadystatechange` ):
      // See matthewwithanm/react-inlinesvg#10.

      // Some browsers don't like you reading XHR properties when the
      // XHR has been aborted. In case we've gotten here as a result
      // of that (either our calling `about()` in the timeout handler
      // or the user calling it directly even though they shouldn't),
      // be careful about accessing it.
      var status, error;
      try {
        status = xhr.status;
      } catch (e) { /*noop*/ }
      error = status === 0 ? new Error('Internal XHR Error') : null;
      return checkIfDone(error);
    }
  };

  // IE sometimes fails if you don't specify every handler.
  // See http://social.msdn.microsoft.com/Forums/ie/en-US/30ef3add-767c-4436-b8a9-f1ca19b4812e/ie9-rtm-xdomainrequest-issued-requests-may-abort-if-all-event-handlers-not-specified?forum=iewebdevelopment
  xhr.ontimeout = function() { /* noop */ };
  xhr.onprogress = function() { /* noop */ };

  xhr.open(req.method, req.url);

  if (req.timeout) {
    // If we use the normal XHR timeout mechanism (`xhr.timeout` and
    // `xhr.ontimeout`), `onreadystatechange` will be triggered before
    // `ontimeout`. There's no way to recognize that it was triggered by
    // a timeout, and we'd be unable to dispatch the right error.
    timeoutId = setTimeout(function() {
      req.timedOut = true;
      checkIfDone();
      try {
        xhr.abort();
      } catch (e) { /*noop*/ }
    }, req.timeout);
  }

  for (k in req.headers) {
    if (req.headers.hasOwnProperty(k)) {
      xhr.setRequestHeader(k, req.headers[k]);
    }
  }

  xhr.send(req.body);
}

/**
 * Run plugin processors on the response in series.
 */
function processResponse(plugins, res) {
  var plugin;

  for (i = 0; i < plugins.length; i++) {
    plugin = plugins[i];
    if (plugin.processResponse) {
      plugin.processResponse(res);
    }
  }
  return res;
}
