'use strict';

module.exports = function(req) {
  var xhr = req.xhr;

  // Try to create the response from the request. If the request was aborted,
  // accesssing properties of the XHR may throw an error, so we wrap in a
  // try/catch.
  try {
    var lines, i, m, headers = {};
    if (xhr.getAllResponseHeaders) {
      lines = xhr.getAllResponseHeaders().split('\n');
      for (i = 0; i < lines.length; i++) {
        if ((m = lines[i].match(/\s*([^\s]+):\s+([^\s]+)/))) {
          headers[m[1]] = m[2];
        }
      }
    }

    return {
      status: xhr.status,
      contentType: xhr.contentType || (xhr.getResponseHeader && xhr.getResponseHeader('Content-Type')),
      headers: headers,
      text: xhr.responseText,
      body: xhr.response || xhr.responseText
    };
  } catch (err) {}

  // Guess the request was aborted.
  return {request: req, xhr: req.xhr};
};
