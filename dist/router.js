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
var Router = _interopRequire(require("isomorphic-router"));

var router = new Router();

[
// patterns are matched from top to bottom.
// pattern      title         description
["/", "Home", "The homepage of my application"], ["/about", "About", "Where I explain what my application does"], ["/contact", "Contact", "You can contact us here"], ["(.*)", "Not found", "Page not found"]].forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var pattern = _ref2[0];
  var title = _ref2[1];
  var description = _ref2[2];
  return router.on(pattern, function (query, params, hash) {
    return { title: title, description: description, query: query, params: params, hash: hash };
  });
});

module.exports = router;