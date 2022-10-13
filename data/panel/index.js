var timeout, manifest = {"url": chrome.runtime.getURL('')};

var background = (function () {
  var r = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.path === 'background-to-ui') {
      for (var id in r) {
        if (request.method === id) r[id](request.data);
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {r[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'ui-to-background', "method": id, "data": data})}
  }
})();

var storage = {
  "GLOBAL": {},
  "read": function (id) {return storage.GLOBAL[id]},
  "init": function () {background.send("storage.init")},
  "update": function (o) {background.send("storage.update", o)},
  "write": function (id, data) {
    storage.GLOBAL[id] = data;
    background.send('app.storage.write', {"id": id, "data": data});
  }
};

var config = {
  "view": function () {
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(function () {
      var size = storage.read("size");
      var _outer = (size.height === window.outerHeight) && (size.width === window.outerWidth);
      var _inner = (size.height === window.innerHeight) && (size.width === window.innerWidth);
      if (_outer || _inner) {
        var table = document.createElement("table");
        table.setAttribute("id", "toolbar");
        /*  */
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("id", "reload");
        td.setAttribute("title", "Reoad current page");
        td.addEventListener("click", function () {document.location.reload()});
        td.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/reload.png)";
        tr.appendChild(td);
        table.appendChild(tr);
        /*  */
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("id", "popout");
        td.setAttribute("title", "Open Messenger in a new tab (note: this window will be closed)");
        td.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/popout.png)";
        tr.appendChild(td);
        table.appendChild(tr);
        /*  */
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("id", "alwaysOnTop");
        td.setAttribute("title", "Make window to stay always on top");
        td.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/unpin.png)";
        tr.appendChild(td);
        table.appendChild(tr);
        /*  */
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("id", "makedark");
        td.setAttribute("title", "Invert the colors using CSS filter");
        td.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/makedark.png)";
        tr.appendChild(td);
        table.appendChild(tr);
        /*  */
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.setAttribute("id", "support");
        td.setAttribute("title", "Open support page");
        td.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/support.png)";
        tr.appendChild(td);
        table.appendChild(tr);
        /*  */
        document.body.insertBefore(table, document.body.firstChild);
        /*  */
        var _popout = document.getElementById("popout");
        var _support = document.getElementById("support");
        var _toolbar = document.getElementById("toolbar");
        var _makedark = document.getElementById("makedark");
        var _messenger = document.getElementById("messenger");
        var _alwaysOnTop = document.getElementById("alwaysOnTop");
        /*  */
        _popout.addEventListener("click", function () {background.send("popout")});
        _support.addEventListener("click", function () {background.send("support")});
        var png = storage.read("alwaysOnTop") ? "pin" : "unpin";
        _alwaysOnTop.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/" + png + ".png)";
        /*  */
        if (_messenger) _messenger.setAttribute("dark", storage.read("dark"));
        else document.body.setAttribute("dark", storage.read("dark"));
        /*  */
        _alwaysOnTop.addEventListener("click", function () {
          var _pin = storage.read("alwaysOnTop");
          _pin = (_pin === true) ? false : true;
          storage.write("alwaysOnTop", _pin);
          background.send("alwaysOnTop", _pin);
          var png = storage.read("alwaysOnTop") ? "pin" : "unpin";
          this.style.backgroundImage = "url(" + manifest.url + "data/panel/icons/" + png + ".png)";
        });
        _makedark.addEventListener("click", function () {
          var _dark = storage.read("dark");
          _dark = (_dark === true) ? false : true;
          storage.write("dark", _dark);
          if (_messenger) _messenger.setAttribute("dark", _dark);
          else document.body.setAttribute("dark", storage.read("dark"));
        });
        /*  */
        window.setTimeout(function () {_toolbar.setAttribute("show", false)}, 3000);
        _toolbar.addEventListener('mouseenter', function (e) {this.setAttribute("show", true)});
        _toolbar.addEventListener('mouseleave', function (e) {this.setAttribute("show", false)});
        /*  */
        window.addEventListener("resize", function (e) {
          var tmp = {"width": e.target.outerWidth, "height": e.target.outerHeight};
          storage.write("size", tmp);
        });
      }
    }, 300);
  }
};

var load = function () {
  background.send("deviceready");
  window.removeEventListener("load", load, false);
};

window.addEventListener("load", load, false);
background.receive('storage.update', storage.update);
background.receive("deviceready", function () {storage.init()});
background.receive("storage.update", function (e) {storage.GLOBAL = e.GLOBAL});

background.receive("storage.init", function (e) {
  storage.GLOBAL = e.GLOBAL;
  config.view();
});
