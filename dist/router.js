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
var Router = _interopRequire(require("isomorphic-router"));

var router = new Router();

function route(title, description) {
  return function (query, params, hash) {
    return { title: title, description: description, query: query, params: params, hash: hash };
  };
}

router.on("/", route("Home", "The homepage of my application"));
router.on("/about", route("About", "Where I explain what my application does"));
router.on("/contact", route("Contact", "You can contact us here"));
router.on("(.*)", route("Not found", "Page not found"));

module.exports = router;