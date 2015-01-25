"use strict";

var _slicedToArray = function (arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  }
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

require("6to5/polyfill");
var _ = require("lodash");
var should = require("should");
var Promise = (global || window).Promise = require("bluebird");
var __DEV__ = process.env.NODE_ENV !== "production";
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === "object";
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}
var express = _interopRequire(require("express"));

var favicon = _interopRequire(require("serve-favicon"));

var Lifespan = _interopRequire(require("lifespan"));

var Nexus = _interopRequire(require("react-nexus"));

var jsesc = _interopRequire(require("jsesc"));

var render = require("./config").render;
var analytics = require("./config").analytics;
var AppClass = _interopRequire(require("./components/App"));

var React = Nexus.React;
var App = React.createFactory(AppClass);
var port = render.port;
var INT_MAX = 9007199254740992;

express().use(favicon(__dirname + "/public/favicon.ico")).use(express["static"](__dirname + "/public")).get("*", function (req, res) {
  var clientID = _.uniqueId("Client" + _.random(1, INT_MAX - 1));
  var lifespan = new Lifespan();
  var nexus = AppClass.createNexus({ req: req }, clientID, lifespan);
  Nexus.prerenderApp(App({ nexus: nexus }), nexus) // pass nexus as a prop to make it visible in the devtools
  .then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var html = _ref2[0];
    var data = _ref2[1];
    lifespan.release();
    var _AppClass$getMeta = AppClass.getMeta({ req: req });

    var title = _AppClass$getMeta.title;
    var description = _AppClass$getMeta.description;
    res.status(200).send("<!doctype html lang='en-US'>\n<html>\n<head>\n  <meta charset='utf-8'>\n  <meta charset='X-UA-Compatible' content='IE=edge'>\n  <title>" + jsesc(title) + "</title>\n  <meta name='description' content='" + jsesc(description) + "'>\n  <link rel='icon' href='/favicon.ico' type='image/x-icon'>\n  <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/normalize/3.0.2/normalize.min.css'>\n  <link rel='stylesheet' href='/c.css'>\n  </head>\n<body>\n  <div id='app-root'>" + html + "</div>\n  <script src='//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js'></script>\n  <script>\n    window.reactNexusData = JSON.parse('" + jsesc(JSON.stringify(data)) + "');\n    window.reactNexusClientID = '" + jsesc(clientID) + "';</script>\n  <script src='/c.js'></script>\n  <script>\n    (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n    function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n    e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n    e.src='//www.google-analytics.com/analytics.js';\n    r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n    ga('create','" + jsesc(analytics.UA) + "','auto');ga('send','pageview');\n  </script>\n</body>\n</html>");
  })["catch"](function (err) {
    res.status(500);
    if (__DEV__) {
      res.type("text/plain").send(err.stack);
    } else {
      res.json({ err: err.message });
    }
  });
}).listen(port);

console.log("render-server listening on port", port);