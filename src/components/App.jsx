import Lifespan from 'lifespan';
import { React, Mixin } from 'react-nexus';
import LocalFlux from 'nexus-flux/adapters/Local';
import RemoteFluxClient from 'nexus-flux-socket.io/client';
import Router from 'isomorphic-router';
import { parse, format } from 'url';

import { flux } from '../config';
const { protocol, host, port } = flux;
const fluxURL = format({ protocol, host, port });

function getFullpath({ req, window }) {
  const href = req ? req.url : (window.location || window.history.location).href;
  const { path, hash } = parse(href);
  return `${path}${hash ? hash : ''}`;
}

const AppClass = React.createClass({
  mixins: [Mixin],

  getNexusBindings() {
    console.warn('getNexusBindings');
    return {
      router: [this.getNexus().local, '/router'],
      info: [this.getNexus().remote, '/info'],
    };
  },

  render() {
    console.warn('this.state', this.state);
    const { info, router } = this.state;
    return <div>
      <div>The server is named {info ? info.get('name') : null},
        its clock show {info ? info.get('clock') : null},
        and there are currently {info ? info.get('connected') : null} connected clients.
      </div>
      <ul>The current routes are:
        {router && router.get('routes') ? router.get('routes').forEach(({ title, description, query, params, hash }, k) =>
          <li key={k}>{title} ({JSON.stringify({ description, query, params, hash })})</li>
        ) : null}
      </ul>
    </div>;
  },

  statics: {
    router: () => {
      const router = new Router();
      const tagRoute = (title, description) => (query, params, hash) => { title, description, query, params, hash };
      router.on('/', tagRoute('Home', 'The homepage of my application'));
      router.on('/about', tagRoute('About', 'Where I explain what my application does'));
      router.on('/contact', tagRoute('Contact', 'You can contact us here'));
      return router;
    }(),

    createNexus({ req, window }, clientID, lifespan) {
      if(__DEV__) {
        clientID.should.be.a.String;
        lifespan.should.be.an.instanceOf(Lifespan);
        if(__NODE__) {
          req.should.be.an.Object;
        }
        if(__BROWSER__) {
          window.should.be.an.Object;
        }
        if(req !== void 0) {
          __NODE__.should.be.true;
        }
        if(window !== void 0) {
          __BROWSER__.should.be.true;
        }
      }
      const localFluxServer = new LocalFlux.Server();
      const nexus = {
        local: new LocalFlux.Client(localFluxServer, clientID),
        remote: new RemoteFluxClient(fluxURL, clientID),
      };
      lifespan.onRelease(() => {
        localFluxServer.lifespan.release();
        nexus.local.lifespan.release();
        nexus.remote.lifespan.release();
      });

      const router = AppClass.router;
      const routerStore = localFluxServer.Store('/router', lifespan);

      localFluxServer.Action('/router/navigate', lifespan)
      .onDispatch(({ url }) => {
        if(__NODE__) {
          return routerStore.set('routes', router.route(url)).commit();
        }
        if(__BROWSER__) {
          return window.history.pushState(null, null, url);
        }
      });

      if(__BROWSER__) {
        function updateMetaTags() {
          const meta = AppClass.getMeta({ window });
          const title = window.document.getElementsByTagName('title')[0];
          if(title) {
            title.textContent = meta.title;
          }
          if(window.document.querySelector) {
            const description = window.document.querySelector('meta[name=description]');
            if(description) {
              description.textContent = meta.description;
            }
          }
        }

        const ln = () => {
          updateMetaTags();
          routerStore.set('routes', router.route(getFullpath(window))).commit();
        };
        window.addEventListener('popstate', ln);
        lifespan.onRelease(() => window.removeEventListener('popstate', ln));
        updateMetaTags();
      }

      routerStore.set('routes', router.route(getFullpath({ req, window }))).commit();
      console.warn(routerStore);

      return nexus;
    },

    getMeta({ req, window }) {
      const routes = AppClass.router.route(url);
      if(routes.length > 1) {
        return routes[0];
      }
      return 'Not found';
    },
  },
});

export default AppClass;
