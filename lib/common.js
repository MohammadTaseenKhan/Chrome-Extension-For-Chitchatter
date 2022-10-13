window.setTimeout(function () {
  if (app.loadReason === "install" || app.loadReason === "startup") {
    var version = config.welcome.version;
    if (!version) app.tab.open(app.homepage() + "?v=" + app.version() + "&type=install");
    else if (config.welcome.open) {
      if (app.version() !== version) {
        app.tab.open(app.homepage() + "?v=" + app.version() + "&p=" + version + "&type=upgrade");
      }
    }
    config.welcome.version = app.version();
  }
}, 3000);

app.UI.receive("popout", function () {
  app.UI.close();
  window.setTimeout(function () { app.tab.open("https://chitchatter.im/") }, 300);
});

app.UI.receive("support", function (o) { app.tab.open(app.homepage()) });
app.UI.receive("deviceready", function () { app.UI.send("deviceready") });
app.UI.receive("app.storage.write", function (o) { app.storage.write(o.id, o.data) });
app.UI.receive("storage.init", function () { app.UI.send("storage.init", { "GLOBAL": app.storage.GLOBAL }) });
app.UI.receive("storage.update", function () { app.UI.send("storage.update", { "GLOBAL": app.storage.GLOBAL }) });

app.options.receive("store", function (e) { config.welcome.open = e.checked });
app.options.receive("load", function () { app.options.send("storage", { "checked": config.welcome.open }) });
