var background = (function () {
  var _tmp = {};
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    for (var id in _tmp) {
      if (_tmp[id] && (typeof _tmp[id] === "function")) {
        if (request.path == 'background-to-options') {
          if (request.method === id) _tmp[id](request.data);
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {_tmp[id] = callback},
    "send": function (id, data) {chrome.runtime.sendMessage({"path": 'options-to-background', "method": id, "data": data})}
  }
})();

var load = function () {
  background.send("load");
  window.removeEventListener("load", load, false);
  document.getElementById("support").addEventListener("click", function (e) {background.send("store", {"checked": e.target.checked})});
};

window.addEventListener("load", load, false);
background.receive("storage", function (e) {document.getElementById("support").checked = e.checked});