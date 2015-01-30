"use strict";

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
var React = require("react-nexus").React;


var Default = React.createClass({
  displayName: "Default",
  render: function render() {
    return React.createElement(
      "div",
      null,
      "Default"
    );
  } });

module.exports = Default;