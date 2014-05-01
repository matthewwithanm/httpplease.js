(function() {
  module.exports = {
    processResponse: function(res) {
      var raw;
      if (res.contentType && /^.*\/(?:.*\+)?json(;|$)/i.test(res.contentType)) {
        raw = typeof res.body === 'string' ? res.body : res.text;
        if (raw) {
          return res.body = JSON.parse(raw);
        }
      }
    }
  };

}).call(this);
