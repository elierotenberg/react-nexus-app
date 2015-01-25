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
var Lifespan = _interopRequire(require("lifespan"));

var Nexus = _interopRequire(require("react-nexus"));

var AppClass = _interopRequire(require("./components/App"));

var React = Nexus.React;
var App = React.createFactory(AppClass);
var INT_MAX = 9007199254740992;

var lifespan = new Lifespan();
var nexus = AppClass.createNexus({ window: window }, window.reactNexusClientID || _.uniqueId("Client" + _.random(1, INT_MAX - 1)), lifespan);
Nexus.mountApp(App({ nexus: nexus }), // pass nexus as a prop to make it accessible in the devtools
nexus, window.reactNexusData || {}, document.getElementById("app-root"));
window.addEventListener("close", lifespan.release);