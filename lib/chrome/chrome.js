var app = {}, windowId, mainWindowId;

app.loadReason = "startup";
app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
if (chrome.runtime.onInstalled) chrome.runtime.onInstalled.addListener(function (e) {app.loadReason = e.reason});
if (chrome.runtime.setUninstallURL) chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});

app.tab = {
  "open": function (url) {
    var tmp = (mainWindowId !== undefined) ? {"url": url, "active": true, "windowId": mainWindowId} : {"url": url, "active": true};
    chrome.tabs.create(tmp);
  }
};

app.storage = (function () {
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {
      app.storage.GLOBAL = o;
      var script = document.createElement("script");
      script.src = "../common.js";
      document.body.appendChild(script);
    });
  }, 300);
  /*  */
  return {
    "GLOBAL": {},
    "read": function (id) {return app.storage.GLOBAL[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      app.storage.GLOBAL[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

app.options = (function () {
  var _tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in _tmp) {
      if (_tmp[id] && (typeof _tmp[id] === "function")) {
        if (request.path === 'options-to-background') {
          if (request.method === id) _tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {_tmp[id] = callback},
    "send": function (id, data, tabId) {
      chrome.runtime.sendMessage({"path": 'background-to-options', "method": id, "data": data});
    }
  }
})();

app.UI = (function () {
  var r = {}, SAOTI;
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.path === 'ui-to-background') {
      for (var id in r) {
        if (r[id] && (typeof r[id] === "function")) {
          if (request.method === id) r[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "close": function () {chrome.windows.remove(windowId)},
    "receive": function (id, callback) {r[id] = callback},
    "send": function (id, data) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          chrome.tabs.sendMessage(tab.id, {"path": 'background-to-ui', "method": id, "data": data}, function () {});
        });
      });
    },
    "create": function () {
      chrome.windows.getCurrent(function (win) {
        mainWindowId = win.id;
        var width = config.UI.size.width;
        var height = config.UI.size.height;
        var url = "https://chitchatter.im/";
        var top = win.top + Math.round((win.height - height) / 2);
        var left = win.left + Math.round((win.width - width) / 2);
        chrome.windows.create({'url': url, 'type': 'popup', 'width': width, 'height': height, 'top': top, 'left': left}, function (w) {windowId = w.id});
      });
    }
  }
})();

app.deviceReady = function (callback) {callback(true)};
chrome.windows.onRemoved.addListener(function (e) {if (e === windowId) {windowId = null}});
chrome.browserAction.onClicked.addListener(function () {windowId ? chrome.windows.update(windowId, {"focused": true}) : app.UI.create()});

chrome.windows.onFocusChanged.addListener(function (e) {
  window.setTimeout(function () {
    if (windowId && e !== windowId) {
      if (config.UI.alwaysOnTop) {
        try {chrome.windows.update(windowId, {"focused": true})} catch (e) {}
      }
    }
  }, 300);
});
