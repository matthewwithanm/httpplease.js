function Request(optsOrUrl) {
  var opts = typeof optsOrUrl === 'string' ? {url: optsOrUrl} : optsOrUrl;
  this.method = opts.method ? opts.method.toUpperCase() : 'GET';
  this.url = opts.url;
  this.headers = opts.headers || {};
  this.body = opts.body;
  this.errorOn404 = opts.errorOn404 != null ? opts.errorOn404 : true;
}

Request.prototype.header = function(name, value) {
  for (var k in this.headers) {
    if (!this.headers.hasOwnProperty(k)) continue;
    if (name.toLowerCase() === k.toLowerCase()) {
      if (arguments.length === 1) {
        return this.headers[k];
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


module.exports = Request;
