import LocalFlux from 'nexus-flux/adapters/Local';
import RemoteFluxClient from 'nexus-flux-socket.io/client';
import { parse, format } from 'url';

import router from './router';
import config from './config';

const { protocol, hostname, port } = config.flux;
const fluxURL = format({ protocol, hostname, port });

const statics = {
    getRoutes({ req, window, url }) {
      const href = url ? url :
        req ? req.url :
        window ? window.location.href : '';
      const { path, hash } = parse(href);
      return router.route(`${path}${hash ? hash : ''}`);
    },

    updateMetaDOMNodes({ window }) {
      if(__DEV__) {
        __BROWSER__.should.be.true;
      }
      const { title, description } = statics.getRoutes({ window })[0];
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
      routerStore.set('routes', statics.getRoutes({ req, window })).commit();
      const clicksStore = server.Store('/clicks', lifespan);
      clicksStore.set('count', 0).commit();

      // Actions
      server.Action('/router/navigate', lifespan).onDispatch(({ url, replaceState }) => {
        replaceState = !!replaceState;
        if(__BROWSER__) { // if in the browser, defer to popstate handler
          if(replaceState) {
            window.history.replaceState(null, null, url);
          }
          else {
            window.history.pushState(null, null, url);
          }
          statics.updateMetaDOMNodes({ window });
        }
        routerStore.set('routes', statics.getRoutes({ url })).commit();
      });
      server.Action('/clicks/increase', lifespan)
      .onDispatch(() => clicksStore.set('count', clicksStore.working.get('count') + 1).commit());

      // Browser-only behaviour
      if(__BROWSER__) {
        const handlePopState = () => {
          statics.updateMetaDOMNodes({ window });
          routerStore.set('routes', statics.getRoutes({ window })).commit();
        };
        window.addEventListener('popstate', handlePopState);
        statics.updateMetaDOMNodes({ window });
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
        local: statics.createLocalFlux({ req, window }, clientID, lifespan),
        remote: statics.createRemoteFlux({ req, window }, clientID, lifespan),
      };
    },
  };

  export default statics;
