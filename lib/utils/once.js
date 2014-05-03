'use strict';

// A non-memoizing "once" utility.
module.exports = function (fn) {
    var called = false;
    return function () {
        if (!called) {
            called = true;
            fn.apply(this, arguments);
        }
    };
};
