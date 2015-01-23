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

var Router = _interopRequire(require("isomorphic-router"));

var parse = require("url").parse;
var format = require("url").format;
var flux = require("../config").flux;
var protocol = flux.protocol;
var host = flux.host;
var port = flux.port;
var fluxURL = format({ protocol: protocol, host: host, port: port });

function getFullpath(_ref) {
  var req = _ref.req;
  var window = _ref.window;
  var href = req ? req.url : (window.location || window.history.location).href;
  var _parse = parse(href);

  var path = _parse.path;
  var hash = _parse.hash;
  return "" + path + "" + (hash ? hash : "");
}

var AppClass = React.createClass({
  displayName: "AppClass",
  mixins: [Mixin],

  getNexusBindings: function getNexusBindings() {
    console.warn("getNexusBindings");
    return {
      router: [this.getNexus().local, "/router"],
      info: [this.getNexus().remote, "/info"] };
  },

  render: function render() {
    console.warn("this.state", this.state);
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
        ",",
        "its clock show ",
        info ? info.get("clock") : null,
        ",",
        "and there are currently ",
        info ? info.get("connected") : null,
        " connected clients."
      ),
      React.createElement(
        "ul",
        null,
        "The current routes are:",
        router && router.get("routes") ? router.get("routes").forEach(function (_ref2, k) {
          var title = _ref2.title;
          var description = _ref2.description;
          var query = _ref2.query;
          var params = _ref2.params;
          var hash = _ref2.hash;
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
    router: (function () {
      var router = new Router();
      var tagRoute = function (title, description) {
        return function (query, params, hash) {
          title, description, query, params, hash;
        };
      };
      router.on("/", tagRoute("Home", "The homepage of my application"));
      router.on("/about", tagRoute("About", "Where I explain what my application does"));
      router.on("/contact", tagRoute("Contact", "You can contact us here"));
      return router;
    })(),

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

      var router = AppClass.router;
      var routerStore = localFluxServer.Store("/router", lifespan);

      localFluxServer.Action("/router/navigate", lifespan).onDispatch(function (_ref4) {
        var url = _ref4.url;
        if (__NODE__) {
          return routerStore.set("routes", router.route(url)).commit();
        }
        if (__BROWSER__) {
          return window.history.pushState(null, null, url);
        }
      });

      if (__BROWSER__) {
        (function () {
          var updateMetaTags = function () {
            var meta = AppClass.getMeta({ window: window });
            var title = window.document.getElementsByTagName("title")[0];
            if (title) {
              title.textContent = meta.title;
            }
            if (window.document.querySelector) {
              var description = window.document.querySelector("meta[name=description]");
              if (description) {
                description.textContent = meta.description;
              }
            }
          };

          var ln = function () {
            updateMetaTags();
            routerStore.set("routes", router.route(getFullpath(window))).commit();
          };
          window.addEventListener("popstate", ln);
          lifespan.onRelease(function () {
            return window.removeEventListener("popstate", ln);
          });
          updateMetaTags();
        })();
      }

      routerStore.set("routes", router.route(getFullpath({ req: req, window: window }))).commit();
      console.warn(routerStore);

      return nexus;
    },

    getMeta: function getMeta(_ref5) {
      var req = _ref5.req;
      var window = _ref5.window;
      var routes = AppClass.router.route(url);
      if (routes.length > 1) {
        return routes[0];
      }
      return "Not found";
    } } });

module.exports = AppClass;