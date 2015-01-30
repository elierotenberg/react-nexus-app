import Lifespan from 'lifespan';
import Nexus from 'react-nexus';
import AnimateMixin from 'react-animate';
const { React } = Nexus;
const NexusMixin = Nexus.Mixin;

import statics from '../statics';
import Link from './Link';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import Default from './Default';

const App = React.createClass({
  mixins: [Lifespan.Mixin, AnimateMixin, NexusMixin],

  getInitialState() {
    return {
      clicks: 0,
    };
  },

  getNexusBindings() {
    return {
      router: [this.getNexus().local, '/router'],
      localClicks: [this.getNexus().local, '/clicks'],
      info: [this.getNexus().remote, '/info'],
      remoteClicks: [this.getNexus().remote, '/clicks'],
    };
  },

  increaseClicks() {
    this.setState({ clicks: this.state.clicks + 1 });
  },

  componentDidMount() {
    this.increaseLocalClicksAction = this.getNexus().local.Action('/clicks/increase', this.getLifespan());
    this.increaseRemoteClicksAction = this.getNexus().remote.Action('/clicks/increase', this.getLifespan());
  },

  increaseLocalClicks() {
    this.increaseLocalClicksAction.dispatch();
  },

  increaseRemoteClicks() {
    this.increaseRemoteClicksAction.dispatch();
  },

  fadeOut() {
    this.animate(
      'fade-out',
      { opacity: 1 },
      { opacity: 0 },
      2000,
      { easing: 'cubic-in-out' }
    );
  },

  render() {
    const {
      clicks,
      info,
      localClicks,
      router,
      remoteClicks,
    } = this.state;

    const [name, clock, connected] = info ? [info.get('name'), info.get('clock'), info.get('connected')] : [null, null, null];
    const routes = router ? router.get('routes') : [];
    const { title, description } = routes[0] || {};
    const lClicks = localClicks ? localClicks.get('count') : null;
    const rClicks = remoteClicks ? remoteClicks.get('count') : null;
    const animatedStyle = this.getAnimatedStyle('fade-out');

    return <div>
      <div>
        The server is named {name}, its clock shows {clock},
        and there are currently {connected} connected clients.
      </div>
      <ul>The current routes are:
        {routes.map(({ title, description, query, params, hash }, k) =>
          <li key={k}>{title} ({JSON.stringify({ description, query, params, hash })})</li>
        )}
      </ul>
      <div>State clicks: {clicks} <button onClick={this.increaseClicks}>increase</button></div>
      <div>Local clicks: {lClicks} <button onClick={this.increaseLocalClicks}>increase</button></div>
      <div>Remote clicks: {rClicks} <button onClick={this.increaseRemoteClicks}>increase</button></div>
      <div><span style={animatedStyle}>This sentence will disappear</span> <button onClick={this.fadeOut}>fade out</button></div>
      {
        title === 'Home' ? <Home /> :
        title === 'About' ? <About /> :
        title === 'Contact' ? <Contact /> :
        <Default />
      }
      <ul>{[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, title]) =>
        <li key={href}><Link href={href}>{title}</Link></li>
      )}</ul>
    </div>;
  },

  statics: Object.assign({}, statics, {
    styles: {
      '*': {
        boxSizing: 'border-box',
      },
    },
  }),
});

export default App;
