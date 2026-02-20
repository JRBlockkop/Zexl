
(function(modules) {
  const cache = {};

  function __require(id) {
    if (cache[id]) return cache[id].exports;

    const module = { exports: {} };
    cache[id] = module;

    modules[id](module, module.exports, __require);

    return module.exports;
  }

  __require(0);
})({

0: function(module, exports, __require) {
console.log('Starting Zexl');
}

});
