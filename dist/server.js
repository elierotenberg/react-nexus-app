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
var fork = require("child_process").fork;
var join = require("path").join;


function spawn(child) {
  (function start() {
    console.log("Starting", child);
    fork(join(__dirname, child), {
      env: {
        NODE_ENV: process.env.NODE_ENV } }).on("exit", function (code) {
      console.warn(child, "exited with code", code);
      start();
    });
  })();
}

spawn("flux-server");
spawn("render-server");