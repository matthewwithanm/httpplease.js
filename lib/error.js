(function() {
  var RequestError, Response,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Response = require('./response');

  RequestError = (function(_super) {
    __extends(RequestError, _super);

    RequestError.prototype.name = 'RequestError';

    function RequestError(message) {
      this.message = message;
    }

    RequestError.create = function(message, req) {
      var err;
      err = new RequestError(message);
      Response.call(err, req);
      return err;
    };

    return RequestError;

  })(Error);

  module.exports = RequestError;

}).call(this);
