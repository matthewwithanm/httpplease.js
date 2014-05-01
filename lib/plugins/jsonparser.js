
module.exports = {
  processResponse: function(res) {
    // Check to see if the contentype is "something/json" or
    // "something/somethingelse+json"
    if (res.contentType && /^.*\/(?:.*\+)?json(;|$)/i.test(res.contentType)) {
      var raw = typeof res.body === 'string' ? res.body : res.text;
      if (raw) {
        return res.body = JSON.parse(raw);
      }
    }
  }
};
