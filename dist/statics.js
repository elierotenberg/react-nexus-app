"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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
var LocalFlux = _interopRequire(require("nexus-flux/adapters/Local"));

var RemoteFluxClient = _interopRequire(require("nexus-flux-socket.io/client"));

var _url = require("url");

var parse = _url.parse;
var format = _url.format;
var router = _interopRequire(require("./router"));

var config = _interopRequire(require("./config"));

var protocol = config.flux.protocol;
var hostname = config.flux.hostname;
var port = config.flux.port;
var fluxURL = format({ protocol: protocol, hostname: hostname, port: port });

var statics = {
  getRoutes: function getRoutes(_ref) {
    var req = _ref.req;
    var window = _ref.window;
    var url = _ref.url;
    var href = url ? url : req ? req.url : window ? window.location.href : "";
    var _parse = parse(href);

    var path = _parse.path;
    var hash = _parse.hash;
    return router.route("" + path + "" + (hash ? hash : ""));
  },

  updateMetaDOMNodes: function updateMetaDOMNodes(_ref) {
    var window = _ref.window;
    if (__DEV__) {
      __BROWSER__.should.be["true"];
    }
    var title = statics.getRoutes({ window: window })[0].title;
    var description = statics.getRoutes({ window: window })[0].description;
    var titleDOMNode = window.document.querySelector("title");
    if (titleDOMNode !== null) {
      titleDOMNode.textContent = title;
    }
    var descriptionDOMNode = window.document.querySelector("meta[name=description]");
    if (descriptionDOMNode !== null) {
      descriptionDOMNode.setAttribute("content", description);
    }
  },

  createLocalFlux: function createLocalFlux(_ref, clientID, lifespan) {
    var req = _ref.req;
    var window = _ref.window;
    var server = new LocalFlux.Server();
    lifespan.onRelease(server.lifespan.release);
    var local = new LocalFlux.Client(server, clientID);
    lifespan.onRelease(local.lifespan.release);

    // Stores
    var routerStore = server.Store("/router", lifespan);
    routerStore.set("routes", statics.getRoutes({ req: req, window: window })).commit();
    var clicksStore = server.Store("/clicks", lifespan);
    clicksStore.set("count", 0).commit();

    // Actions
    server.Action("/router/navigate", lifespan).onDispatch(function (_ref2) {
      var url = _ref2.url;
      var replaceState = _ref2.replaceState;
      replaceState = !!replaceState;
      if (__BROWSER__) {
        // if in the browser, defer to popstate handler
        if (replaceState) {
          window.history.replaceState(null, null, url);
        } else {
          window.history.pushState(null, null, url);
        }
        statics.updateMetaDOMNodes({ window: window });
      }
      routerStore.set("routes", statics.getRoutes({ url: url })).commit();
    });
    server.Action("/clicks/increase", lifespan).onDispatch(function () {
      return clicksStore.set("count", clicksStore.working.get("count") + 1).commit();
    });

    // Browser-only behaviour
    if (__BROWSER__) {
      (function () {
        var handlePopState = function () {
          statics.updateMetaDOMNodes({ window: window });
          routerStore.set("routes", statics.getRoutes({ window: window })).commit();
        };
        window.addEventListener("popstate", handlePopState);
        statics.updateMetaDOMNodes({ window: window });
        lifespan.onRelease(function () {
          return window.removeEventListener("popstate", handlePopState);
        });
      })();
    }

    return local;
  },

  createRemoteFlux: function createRemoteFlux(_ref, clientID, lifespan) {
    var req = _ref.req;
    var window = _ref.window;
    var remote = new RemoteFluxClient(fluxURL, clientID);
    lifespan.onRelease(remote.lifespan.release);

    return remote;
  },

  createNexus: function createNexus(_ref, clientID, lifespan) {
    var req = _ref.req;
    var window = _ref.window;
    return {
      local: statics.createLocalFlux({ req: req, window: window }, clientID, lifespan),
      remote: statics.createRemoteFlux({ req: req, window: window }, clientID, lifespan) };
  } };

module.exports = statics;