'use strict';

var Response = require('./response');

function RequestError(message) {
    var err = new Error(message);
    err.name = 'RequestError';
    this.name = err.name;
    this.message = err.message;
    if (err.stack) {
        this.stack = err.stack;
    }

    this.toString = function () {
        return this.name + ': ' + this.message;
    };
}

RequestError.prototype = Error.prototype;

RequestError.create = function (message, req) {
    var err = new RequestError(message);
    Response.call(err, req);
    return err;
};

module.exports = RequestError;
