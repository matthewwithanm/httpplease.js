(function() {
  var Request, Response;

  Request = require('./request');

  Response = (function() {
    function Response(req) {
      var xhr;
      xhr = req.xhr;
      this.request = req;
      this.xhr = xhr;
      this.status = xhr.status || 0;
      this.text = xhr.responseText;
      this.body = xhr.response || xhr.responseText;
      this.contentType = xhr.contentType || (typeof xhr.getResponseHeader === "function" ? xhr.getResponseHeader('Content-Type') : void 0);
      this.headers = (function() {
        var header, headers, lines, m, _i, _len;
        headers = {};
        if (lines = typeof xhr.getAllResponseHeaders === "function" ? xhr.getAllResponseHeaders().split('\n') : void 0) {
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            header = lines[_i];
            if (m = header.match(/\s+([^\s]+):\s+([^\s]+)/)) {
              headers[m[1]] = m[2];
            }
          }
        }
        return headers;
      })();
      this.isHttpError = this.status >= 400;
    }

    Response.prototype.header = Request.prototype.header;

    return Response;

  })();

  module.exports = Response;

}).call(this);
