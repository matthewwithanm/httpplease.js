(function() {
  var once, supportsXHR, urllite,
    __hasProp = {}.hasOwnProperty;

  urllite = require('urllite/lib/core');

  once = require('once');

  supportsXHR = once(function() {
    return (typeof window !== "undefined" && window !== null ? window.XMLHttpRequest : void 0) && 'withCredentials' in new window.XMLHttpRequest;
  });

  module.exports = {
    createXHR: function(req) {
      var a, b, k, _ref;
      if (typeof window === "undefined" || window === null) {
        return;
      }
      a = urllite(req.url);
      b = urllite(window.location.href);
      if (!a.host) {
        return;
      }
      if (a.protocol === b.protocol && a.host === b.host && a.port === b.port) {
        return;
      }
      if (req.headers) {
        _ref = req.headers;
        for (k in _ref) {
          if (!__hasProp.call(_ref, k)) continue;
          throw new Error("You can't provide request headers when using the oldiexdomain plugin.");
        }
      }
      if (!window.XDomainRequest) {
        return;
      }
      if (supportsXHR()) {
        return;
      }
      return new window.XDomainRequest;
    }
  };

}).call(this);
