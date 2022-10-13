var config = {};

config.welcome = {
  set open(val) { app.storage.write("support", val) },
  get version() { return app.storage.read("version") },
  set version(val) { app.storage.write("version", val) },
  get open() { return (app.storage.read("support") !== undefined ? app.storage.read("support") : true) }
};

config.UI = {
  set size(o) { if (o) app.storage.write("size", o) },
  set alwaysOnTop(val) { app.storage.write("alwaysOnTop", val) },
  get alwaysOnTop() { return (app.storage.read("alwaysOnTop") !== undefined ? app.storage.read("alwaysOnTop") : false) },
  get size() {
    var _size = app.storage.read("size");
    if (_size) return _size;
    else {
      var tmp = { "width": 900, "height": 600 };
      config.UI.size = tmp;
      return tmp;
    }
  }
};