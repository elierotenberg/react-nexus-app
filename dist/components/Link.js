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
var Nexus = _interopRequire(require("react-nexus"));

var Lifespan = _interopRequire(require("lifespan"));

var React = Nexus.React;


var Link = React.createClass({
  displayName: "Link",
  mixins: [Nexus.Mixin, Lifespan.Mixin],

  _navigate: null,

  componentDidMount: function componentDidMount() {
    this._navigate = this.getNexus().local.Action("/router/navigate", this.getLifespan());
  },

  followLink: function followLink(ev) {
    ev.preventDefault();
    this._navigate.dispatch({ url: this.props.href });
  },

  render: function render() {
    return React.createElement(
      "a",
      { href: this.props.href, onClick: this.followLink },
      this.props.children
    );
  } });

module.exports = Link;