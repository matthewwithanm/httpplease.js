(function() {
  var Request,
    __hasProp = {}.hasOwnProperty;

  Request = (function() {
    function Request(optsOrUrl) {
      var opts, _ref, _ref1;
      opts = typeof optsOrUrl === 'string' ? {
        url: optsOrUrl
      } : optsOrUrl;
      this.method = ((_ref = opts.method) != null ? _ref.toUpperCase() : void 0) || 'GET';
      this.url = opts.url;
      this.headers = opts.headers || {};
      this.body = opts.body;
      this.errorOn404 = (_ref1 = opts.errorOn404) != null ? _ref1 : true;
    }

    Request.prototype.header = function(name, value) {
      var k, v, _ref;
      _ref = this.headers;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        if (name.toLowerCase() === k.toLowerCase()) {
          if (arguments.length === 1) {
            return v;
          } else {
            delete this.headers[k];
            break;
          }
        }
      }
      if (value != null) {
        return this.headers[name] = value;
      }
    };

    return Request;

  })();

  module.exports = Request;

}).call(this);
