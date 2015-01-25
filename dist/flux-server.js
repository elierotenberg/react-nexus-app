"use strict";

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
var RemoteFluxServer = _interopRequire(require("nexus-flux-socket.io/server"));

var flux = require("./config").flux;
var port = flux.port;
var server = new RemoteFluxServer(port);

var info = server.Store("/info", server.lifespan);
info.set("name", "React Nexus App").set("clock", Date.now()).set("connected", 0).commit();
server.on("link:add", function () {
  return info.set("connected", info.working.get("connected") + 1).commit();
}, server.lifespan).on("link:remove", function () {
  return info.set("connected", info.working.get("connected") - 1).commit();
}, server.lifespan);

server.lifespan.setInterval(function () {
  return info.set("clock", Date.now()).commit();
}, 187);

console.log("flux-server listening on port", port);