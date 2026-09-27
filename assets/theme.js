(function () {
  window.Theme = window.Theme || {};

  window.Theme.debounce = function (fn, wait) {
    var timeout;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait || 150);
    };
  };
})();
