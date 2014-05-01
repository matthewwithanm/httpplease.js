(function() {
  module.exports = {
    createXHR: function() {
      if (!(typeof window !== "undefined" && window !== null ? window.XMLHttpRequest : void 0)) {
        try {
          return new ActiveXObject('Msxml2.XMLHTTP.6.0');
        } catch (_error) {}
        try {
          return new ActiveXObject('Msxml2.XMLHTTP.3.0');
        } catch (_error) {}
        try {
          return new ActiveXObject('Microsoft.XMLHTTP');
        } catch (_error) {}
      }
    }
  };

}).call(this);
