import Lifespan from 'lifespan';
import Nexus from 'react-nexus';
import LocalFlux from 'nexus-flux/adapters/Local';
import RemoteFluxClient from 'nexus-flux-socket.io/client';
import { parse, format } from 'url';
import AnimateMixin from 'react-animate';
const { React } = Nexus;
const NexusMixin = Nexus.Mixin;

import config from '../config';
import router from '../router';

const { protocol, hostname, port } = config.flux;
const fluxURL = format({ protocol, hostname, port });

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
    return <div>
      <div>
        The server is named {info ? info.get('name') : null}, its clock shows {info ? info.get('clock') : null} (lagging of {info ? Date.now() - info.get('clock') : null}),
        and there are currently {info ? info.get('connected') : null} connected clients.
      </div>
      <ul>The current routes are:
        {router && router.get('routes') ? router.get('routes').map(({ title, description, query, params, hash }, k) =>
          <li key={k}>{title} ({JSON.stringify({ description, query, params, hash })})</li>
        ) : null}
      </ul>
      <div>State clicks: {clicks} <button onClick={this.increaseClicks}>increase</button></div>
      <div>Local clicks: {localClicks.get('count')} <button onClick={this.increaseLocalClicks}>increase</button></div>
      <div>Remote clicks: {remoteClicks.get('count')} <button onClick={this.increaseRemoteClicks}>increase</button></div>
      <div><span style={this.getAnimatedStyle('fade-out')}>This sentence will disappear</span> <button onClick={this.fadeOut}>fade out</button></div>
    </div>;
  },

  statics: {
    styles: {
      '*': {
        boxSizing: 'border-box',
      },
    },

    getRoutes({ req, window, url }) {
      const href = url ? url :
        req ? req.url :
        window ? (window.location || window.history.location).href : null;
      const { path, hash } = parse(href);
      return router.route(`${path}${hash ? hash : ''}`);
    },

    updateMetaDOMNodes(window) {
      if(__DEV__) {
        __BROWSER__.should.be.true;
      }
      const { title, description } = App.getRoutes({ window })[0];
      const titleDOMNode = window.document.querySelector('title');
      if(titleDOMNode !== null) {
        titleDOMNode.textContent = title;
      }
      const descriptionDOMNode = window.document.querySelector('meta[name=description]');
      if(descriptionDOMNode !== null) {
        descriptionDOMNode.setAttribute('content', description);
      }
    },

    createLocalFlux({ req, window }, clientID, lifespan) {
      const server = new LocalFlux.Server();
      lifespan.onRelease(server.lifespan.release);
      const local = new LocalFlux.Client(server, clientID);
      lifespan.onRelease(local.lifespan.release);

      // Stores
      const routerStore = server.Store('/router', lifespan);
      routerStore.set('routes', App.getRoutes({ req, window })).commit();
      const clicksStore = server.Store('/clicks', lifespan);
      clicksStore.set('count', 0).commit();

      // Actions
      server.Action('/router/navigate', lifespan).onDispatch(({ url }) => {
        if(__BROWSER__) { // if in the browser, defer to popstate handler
          window.history.pushState(null, null, url);
        }
        if(__NODE__) { // if in node, handle directly
          routerStore.set('routes', App.getRoutes({ url })).commit();
        }
      });
      server.Action('/clicks/increase', lifespan).onDispatch(() => {
        clicksStore.set('count', clicksStore.working.get('count') + 1).commit()
      });

      // Browser-only behaviour
      if(__BROWSER__) {
        function handlePopState() {
          App.updateMetaDOMNodes({ window });
          routerStore.set('routes', App.getRoutes({ window })).commit();
        }
        window.addEventListener('popstate', handlePopState);
        lifespan.onRelease(() => window.removeEventListener('popstate', handlePopState));
      }

      return local;
    },

    createRemoteFlux({ req, window }, clientID, lifespan) {
      const remote = new RemoteFluxClient(fluxURL, clientID);
      lifespan.onRelease(remote.lifespan.release);

      return remote;
    },

    createNexus({ req, window }, clientID, lifespan) {
      return {
        local: App.createLocalFlux({ req, window }, clientID, lifespan),
        remote: App.createRemoteFlux({ req, window }, clientID, lifespan),
      };
    },
  },
});

export default App;
