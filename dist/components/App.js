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

var React = require("react-nexus").React;
var Mixin = require("react-nexus").Mixin;
var LocalFlux = _interopRequire(require("nexus-flux/adapters/Local"));

var RemoteFluxClient = _interopRequire(require("nexus-flux-socket.io/client"));

var parse = require("url").parse;
var format = require("url").format;
var flux = require("../config").flux;
var router = _interopRequire(require("../router"));

var protocol = flux.protocol;
var hostname = flux.hostname;
var port = flux.port;
var fluxURL = format({ protocol: protocol, hostname: hostname, port: port });

var App = React.createClass({
  displayName: "App",
  mixins: [Mixin],

  getNexusBindings: function getNexusBindings() {
    return {
      router: [this.getNexus().local, "/router"],
      info: [this.getNexus().remote, "/info"] };
  },

  render: function render() {
    var info = this.state.info;
    var router = this.state.router;
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        "The server is named ",
        info ? info.get("name") : null,
        ", its clock shows ",
        info ? info.get("clock") : null,
        ", and there are currently ",
        info ? info.get("connected") : null,
        " connected clients."
      ),
      React.createElement(
        "ul",
        null,
        "The current routes are:",
        router && router.get("routes") ? router.get("routes").map(function (_ref, k) {
          var title = _ref.title;
          var description = _ref.description;
          var query = _ref.query;
          var params = _ref.params;
          var hash = _ref.hash;
          return React.createElement(
            "li",
            { key: k },
            title,
            " (",
            JSON.stringify({ description: description, query: query, params: params, hash: hash }),
            ")"
          );
        }) : null
      )
    );
  },

  statics: {
    styles: {
      "*": {
        boxSizing: "border-box" } },

    getRoutes: function getRoutes(_ref2) {
      var req = _ref2.req;
      var window = _ref2.window;
      var url = _ref2.url;
      var href = url ? url : req ? req.url : window ? (window.location || window.history.location).href : null;
      var _parse = parse(href);

      var path = _parse.path;
      var hash = _parse.hash;
      return router.route("" + path + "" + (hash ? hash : ""));
    },

    createNexus: function createNexus(_ref3, clientID, lifespan) {
      var req = _ref3.req;
      var window = _ref3.window;
      if (__DEV__) {
        clientID.should.be.a.String;
        lifespan.should.be.an.instanceOf(Lifespan);
        if (__NODE__) {
          req.should.be.an.Object;
        }
        if (__BROWSER__) {
          window.should.be.an.Object;
        }
        if (req !== void 0) {
          __NODE__.should.be["true"];
        }
        if (window !== void 0) {
          __BROWSER__.should.be["true"];
        }
      }
      var localFluxServer = new LocalFlux.Server();
      var nexus = {
        local: new LocalFlux.Client(localFluxServer, clientID),
        remote: new RemoteFluxClient(fluxURL, clientID) };
      lifespan.onRelease(function () {
        localFluxServer.lifespan.release();
        nexus.local.lifespan.release();
        nexus.remote.lifespan.release();
      });

      var routerStore = localFluxServer.Store("/router", lifespan);

      localFluxServer.Action("/router/navigate", lifespan).onDispatch(function (_ref4) {
        var url = _ref4.url;
        if (__NODE__) {
          return routerStore.set("routes", App.getRoutes({ url: url })).commit();
        }
        if (__BROWSER__) {
          return window.history.pushState(null, null, url);
        }
      });

      if (__BROWSER__) {
        (function () {
          var updateMetaTags = function () {
            var _App$getMeta = App.getMeta({ window: window });

            var title = _App$getMeta.title;
            var description = _App$getMeta.description;
            var titleTag = window.document.getElementsByTagName("title")[0];
            if (titleTag) {
              titleTag.textContent = title;
            }
            if (window.document.querySelector) {
              var descriptionTag = window.document.querySelector("meta[name=description]");
              if (descriptionTag) {
                descriptionTag.textContent = description;
              }
            }
          };

          var ln = function () {
            updateMetaTags();
            routerStore.set("routes", App.getRoutes({ window: window })).commit();
          };
          window.addEventListener("popstate", ln);
          lifespan.onRelease(function () {
            return window.removeEventListener("popstate", ln);
          });
          updateMetaTags();
        })();
      }

      routerStore.set("routes", App.getRoutes({ req: req, window: window })).commit();

      return nexus;
    },

    getMeta: function getMeta(_ref5) {
      var req = _ref5.req;
      var window = _ref5.window;
      return App.getRoutes({ req: req, window: window })[0];
    } } });

module.exports = App;