import Nexus from 'react-nexus';
import Lifespan from 'lifespan';
const { React } = Nexus;

const Link = React.createClass({
  mixins: [Nexus.Mixin, Lifespan.Mixin],

  _navigate: null,

  componentDidMount() {
    this._navigate = this.getNexus().local.Action('/router/navigate', this.getLifespan());
  },

  followLink(ev) {
    ev.preventDefault();
    this._navigate.dispatch({ url: this.props.href });
  },

  render() {
    return <a href={this.props.href} onClick={this.followLink}>{this.props.children}</a>;
  },
});

export default Link;
