(function() {
  var delay,
    __slice = [].slice;

  delay = function(fn) {
    return function() {
      var args, newFunc;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      newFunc = function() {
        return fn.apply(null, args);
      };
      setTimeout(newFunc, 0);
    };
  };

  module.exports = delay;

}).call(this);
