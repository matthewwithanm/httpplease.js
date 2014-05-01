(function() {
  module.exports = {
    processRequest: function(req) {
      return req.url = req.url.replace(/[^%]+/g, function(s) {
        return encodeURI(s);
      });
    }
  };

}).call(this);
