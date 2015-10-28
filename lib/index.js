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
  defaults = defaults || {};

  function http(req, cb) {
    var done, xhr;

    // Use a single completion callback.
    done = once(delay(function(err, res) {
      // Invoke callbacks
      if (err && req.onerror) req.onerror(err);
      if (!err && req.onload) req.onload(res);
      if (cb) cb(err, err ? undefined : res);
    }));

    // Only process the request if it hasn't been processed yet.
    if (!req || !req.processed) {
      req = processRequest(plugins, new Request(extend(defaults, req)));
    }

    xhr = createXHR(plugins, req);
    req.xhr = xhr;

    sendAndProcessResponse(http, plugins, req, done);

    return req;
  }

  var method,
    methods = ['get', 'post', 'put', 'head', 'patch', 'delete'],
    verb = function(method) {
      return function(req, cb) {
        // Only wrap in a new request if the provided request hasn't been
        // processed or if the method has changed.
        if (!req.processed || req.method !== method.toUpperCase()) {
          req = new Request(req);
          req.method = method;
        }
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

  // Flag this request as processed. This guards against unecessarily
  // reprocessing the same request (which might happen in a retry scenario,
  // for example).
  req.processed = true;

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
function sendAndProcessResponse(httpInstance, plugins, req, reallyDone) {
  var k, err, res, timeoutId, done, supportsLoadAndErrorEvents,
      xhr = req.xhr;

  // This can be called with or without an error. If no error is passed, the
  // request will be examined to see if it was successful.
  done = function(rawError) {
    clearTimeout(timeoutId);
    xhr.onload = xhr.onerror = xhr.onabort = xhr.onreadystatechange = xhr.ontimeout = xhr.onprogress = null;

    err = getError(req, rawError);

    res = err || Response.fromRequest(req);

    processResponse(httpInstance, plugins, res, function(processedRes) {
      var error, response;
      if (processedRes instanceof RequestError || processedRes instanceof Error) {
        error = processedRes;
      } else {
        response = processedRes;
      }
      reallyDone(error, response);
    });
  };

  supportsLoadAndErrorEvents = ('onload' in xhr) && ('onerror' in xhr);
  xhr.onload = function() { done(); };
  xhr.onerror = done;
  xhr.onabort = function() { done(); };

  // We'd rather use `onload`, `onerror`, and `onabort` since they're the
  // only way to reliably detect successes and failures but, if they
  // aren't available, we fall back to using `onreadystatechange`.
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;

    if (req.aborted) return done();

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
      return done(error);
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
      done();
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
 * Run plugin processors on the response in series by passing a 'next'
 * continuation to each processor in turn, until the final
 * processor, which is given the `done` callback as a continuation.
 */
function processResponse(httpInstance, plugins, res, done) {
  var fn, processors, plugin, current, total, next;

  // Make a list of plugins that have `processResponse` hooks.
  processors = [];
  for (i = 0; i < plugins.length; i++) {
    plugin = plugins[i];
    if (plugin.processResponse) {
      processors.push(plugin.processResponse);
    }
  }

  total = processors.length;

  // If we don't have any proccessing to do, just finish up early.
  if (!total) return done(res);

  current = 0;

  // Pass the partially processed response to the next processor.
  next = function(partiallyProcessedRes) {
    // Let the next plugin process the response.
    // Note that we don't expect the processor to
    // return a new res value, but a function (or `null`).
    // If the return value is a function, then it will be
    // passed a continuation callback. The callback expects
    // the new response as its only argument.
    fn = processors[current](partiallyProcessedRes);

    current += 1;

    if (typeof fn === 'function') {
      if (current < total) {
        // If the plugin's processResponse returned a function,
        // call it to continue processing, passing `next`...
        fn.call(httpInstance, next, done);
      } else {
        // ...or pass our `done` callback, if this is the last processor.
        fn.call(httpInstance, done, done);
      }
    } else {
      if (current < total) {
        // If the plugin's processResponse didn't return a function,
        // immediately move to the next processor...
        next(partiallyProcessedRes);
      } else {
        // ...or call our `done` callback, if we're done processing.
        done(partiallyProcessedRes);
      }
    }
  };

  // Kick the processing series off!
  next(res);
}
