module.exports = function(fn) {
  return function() {
    var
      args = Array.prototype.slice.call(arguments, 0),
      newFunc = function() {
        return fn.apply(null, args);
      };
    setTimeout(newFunc, 0);
  };
};
