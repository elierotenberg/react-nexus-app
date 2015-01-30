"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } };

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

var AnimateMixin = _interopRequire(require("react-animate"));

var React = Nexus.React;
var NexusMixin = Nexus.Mixin;

var statics = _interopRequire(require("../statics"));

var Link = _interopRequire(require("./Link"));

var Home = _interopRequire(require("./Home"));

var About = _interopRequire(require("./About"));

var Contact = _interopRequire(require("./Contact"));

var Default = _interopRequire(require("./Default"));

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
    var _ref = info ? [info.get("name"), info.get("clock"), info.get("connected")] : [null, null, null];
    var _ref2 = _slicedToArray(_ref, 3);

    var name = _ref2[0];
    var clock = _ref2[1];
    var connected = _ref2[2];
    var routes = router ? router.get("routes") : [];
    var _ref3 = routes[0] || {};
    var title = _ref3.title;
    var description = _ref3.description;
    var lClicks = localClicks ? localClicks.get("count") : null;
    var rClicks = remoteClicks ? remoteClicks.get("count") : null;
    var animatedStyle = this.getAnimatedStyle("fade-out");

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        "The server is named ",
        name,
        ", its clock shows ",
        clock,
        ",",
        "and there are currently ",
        connected,
        " connected clients."
      ),
      React.createElement(
        "ul",
        null,
        "The current routes are:",
        routes.map(function (_ref4, k) {
          var title = _ref4.title;
          var description = _ref4.description;
          var query = _ref4.query;
          var params = _ref4.params;
          var hash = _ref4.hash;
          return React.createElement(
            "li",
            { key: k },
            title,
            " (",
            JSON.stringify({ description: description, query: query, params: params, hash: hash }),
            ")"
          );
        })
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
        lClicks,
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
        rClicks,
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
          { style: animatedStyle },
          "This sentence will disappear"
        ),
        " ",
        React.createElement(
          "button",
          { onClick: this.fadeOut },
          "fade out"
        )
      ),
      title === "Home" ? React.createElement(Home, null) : title === "About" ? React.createElement(About, null) : title === "Contact" ? React.createElement(Contact, null) : React.createElement(Default, null),
      React.createElement(
        "ul",
        null,
        [["/", "Home"], ["/about", "About"], ["/contact", "Contact"]].map(function (_ref4) {
          var _ref42 = _slicedToArray(_ref4, 2);

          var href = _ref42[0];
          var title = _ref42[1];
          return React.createElement(
            "li",
            { key: href },
            React.createElement(
              Link,
              { href: href },
              title
            )
          );
        })
      )
    );
  },

  statics: Object.assign({}, statics, {
    styles: {
      "*": {
        boxSizing: "border-box" } } }) });

module.exports = App;