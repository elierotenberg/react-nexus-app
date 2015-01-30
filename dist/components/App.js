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
var Lifespan = _interopRequire(require("lifespan"));

var Nexus = _interopRequire(require("react-nexus"));

var LocalFlux = _interopRequire(require("nexus-flux/adapters/Local"));

var RemoteFluxClient = _interopRequire(require("nexus-flux-socket.io/client"));

var _url = require("url");

var parse = _url.parse;
var format = _url.format;
var AnimateMixin = _interopRequire(require("react-animate"));

var React = Nexus.React;
var NexusMixin = Nexus.Mixin;

var config = _interopRequire(require("../config"));

var router = _interopRequire(require("../router"));

var protocol = config.flux.protocol;
var hostname = config.flux.hostname;
var port = config.flux.port;
var fluxURL = format({ protocol: protocol, hostname: hostname, port: port });

var App = React.createClass({
  displayName: "App",
  mixins: [Lifespan.Mixin, AnimateMixin, NexusMixin],

  getInitialState: function getInitialState() {
    return {
      clicks: 0 };
  },

  getNexusBindings: function getNexusBindings() {
    return {
      router: [this.getNexus().local, "/router"],
      localClicks: [this.getNexus().local, "/clicks"],
      info: [this.getNexus().remote, "/info"],
      remoteClicks: [this.getNexus().remote, "/clicks"] };
  },

  increaseClicks: function increaseClicks() {
    this.setState({ clicks: this.state.clicks + 1 });
  },

  componentDidMount: function componentDidMount() {
    this.increaseLocalClicksAction = this.getNexus().local.Action("/clicks/increase", this.getLifespan());
    this.increaseRemoteClicksAction = this.getNexus().remote.Action("/clicks/increase", this.getLifespan());
  },

  increaseLocalClicks: function increaseLocalClicks() {
    this.increaseLocalClicksAction.dispatch();
  },

  increaseRemoteClicks: function increaseRemoteClicks() {
    this.increaseRemoteClicksAction.dispatch();
  },

  fadeOut: function fadeOut() {
    this.animate("fade-out", { opacity: 1 }, { opacity: 0 }, 2000, { easing: "cubic-in-out" });
  },

  render: function render() {
    var clicks = this.state.clicks;
    var info = this.state.info;
    var localClicks = this.state.localClicks;
    var router = this.state.router;
    var remoteClicks = this.state.remoteClicks;
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
        " (lagging of ",
        info ? Date.now() - info.get("clock") : null,
        "),",
        "and there are currently ",
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
      ),
      React.createElement(
        "div",
        null,
        "State clicks: ",
        clicks,
        " ",
        React.createElement(
          "button",
          { onClick: this.increaseClicks },
          "increase"
        )
      ),
      React.createElement(
        "div",
        null,
        "Local clicks: ",
        localClicks.get("count"),
        " ",
        React.createElement(
          "button",
          { onClick: this.increaseLocalClicks },
          "increase"
        )
      ),
      React.createElement(
        "div",
        null,
        "Remote clicks: ",
        remoteClicks.get("count"),
        " ",
        React.createElement(
          "button",
          { onClick: this.increaseRemoteClicks },
          "increase"
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "span",
          { style: this.getAnimatedStyle("fade-out") },
          "This sentence will disappear"
        ),
        " ",
        React.createElement(
          "button",
          { onClick: this.fadeOut },
          "fade out"
        )
      )
    );
  },

  statics: {
    styles: {
      "*": {
        boxSizing: "border-box" } },

    getRoutes: function getRoutes(_ref) {
      var req = _ref.req;
      var window = _ref.window;
      var url = _ref.url;
      var href = url ? url : req ? req.url : window ? (window.location || window.history.location).href : null;
      var _parse = parse(href);

      var path = _parse.path;
      var hash = _parse.hash;
      return router.route("" + path + "" + (hash ? hash : ""));
    },

    updateMetaDOMNodes: function updateMetaDOMNodes(window) {
      if (__DEV__) {
        __BROWSER__.should.be["true"];
      }
      var title = App.getRoutes({ window: window })[0].title;
      var description = App.getRoutes({ window: window })[0].description;
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
      routerStore.set("routes", App.getRoutes({ req: req, window: window })).commit();
      var clicksStore = server.Store("/clicks", lifespan);
      clicksStore.set("count", 0).commit();

      // Actions
      server.Action("/router/navigate", lifespan).onDispatch(function (_ref2) {
        var url = _ref2.url;
        if (__BROWSER__) {
          // if in the browser, defer to popstate handler
          window.history.pushState(null, null, url);
        }
        if (__NODE__) {
          // if in node, handle directly
          routerStore.set("routes", App.getRoutes({ url: url })).commit();
        }
      });
      server.Action("/clicks/increase", lifespan).onDispatch(function () {
        clicksStore.set("count", clicksStore.working.get("count") + 1).commit();
      });

      // Browser-only behaviour
      if (__BROWSER__) {
        (function () {
          var handlePopState = function () {
            App.updateMetaDOMNodes({ window: window });
            routerStore.set("routes", App.getRoutes({ window: window })).commit();
          };
          window.addEventListener("popstate", handlePopState);
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
        local: App.createLocalFlux({ req: req, window: window }, clientID, lifespan),
        remote: App.createRemoteFlux({ req: req, window: window }, clientID, lifespan) };
    } } });

module.exports = App;