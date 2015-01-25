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
module.exports = {
  render: {
    port: 8000 },
  flux: {
    protocol: "http",
    hostname: "localhost",
    port: 8080 },
  analytics: {
    UA: "UA-XXXXX-X" } };