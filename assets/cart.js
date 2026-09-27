/**
 * Cart API compartida — usada por header (drawer), ficha de producto y página de carrito.
 * Sin dependencias. Emite 'cart:updated' y 'cart:error' en document con { cart, drawerHTML, openDrawer }.
 */
(function () {
  function requestJSON(url, options) {
    return fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }, options))
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) { throw err; });
        }
        return res.json();
      });
  }

  function fetchDrawerHTML() {
    return fetch('/?sections=cart-drawer')
      .then(function (res) { return res.json(); })
      .then(function (sections) {
        var html = sections['cart-drawer'];
        if (!html) return null;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var content = doc.getElementById('CartDrawer-Content');
        return content ? content.innerHTML : null;
      })
      .catch(function () { return null; });
  }

  function emitUpdated(cart, openDrawer) {
    return fetchDrawerHTML().then(function (drawerHTML) {
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart, drawerHTML: drawerHTML, openDrawer: !!openDrawer } }));
      return cart;
    });
  }

  function emitError(err) {
    document.dispatchEvent(new CustomEvent('cart:error', { detail: err }));
    throw err;
  }

  var CartAPI = {
    get: function () {
      return requestJSON('/cart.js', { method: 'GET' });
    },
    add: function (items) {
      return requestJSON('/cart/add.js', { method: 'POST', body: JSON.stringify({ items: items }) })
        .then(function () { return CartAPI.get(); })
        .then(function (cart) { return emitUpdated(cart, true); })
        .catch(emitError);
    },
    changeLine: function (line, quantity) {
      return requestJSON('/cart/change.js', { method: 'POST', body: JSON.stringify({ line: line, quantity: quantity }) })
        .then(function (cart) { return emitUpdated(cart, false); })
        .catch(emitError);
    },
    changeByKey: function (key, quantity) {
      return requestJSON('/cart/change.js', { method: 'POST', body: JSON.stringify({ id: key, quantity: quantity }) })
        .then(function (cart) { return emitUpdated(cart, false); })
        .catch(emitError);
    }
  };

  window.CartAPI = CartAPI;

  document.addEventListener('click', function (event) {
    var opener = event.target.closest('[data-cart-drawer-open]');
    if (opener) {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('cart-drawer:open'));
    }
  });
})();
