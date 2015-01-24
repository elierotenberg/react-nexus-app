import Lifespan from 'lifespan';
import { React, Mixin } from 'react-nexus';
import LocalFlux from 'nexus-flux/adapters/Local';
import RemoteFluxClient from 'nexus-flux-socket.io/client';
import { parse, format } from 'url';

import { flux } from '../config';
import router from '../router';

const { protocol, hostname, port } = flux;
const fluxURL = format({ protocol, hostname, port });

const App = React.createClass({
  mixins: [Mixin],

  getNexusBindings() {
    return {
      router: [this.getNexus().local, '/router'],
      info: [this.getNexus().remote, '/info'],
    };
  },

  render() {
    const { info, router } = this.state;
    return <div>
      <div>
        The server is named {info ? info.get('name') : null}, its clock shows {info ? info.get('clock') : null}, and there are currently {info ? info.get('connected') : null} connected clients.
      </div>
      <ul>The current routes are:
        {router && router.get('routes') ? router.get('routes').map(({ title, description, query, params, hash }, k) =>
          <li key={k}>{title} ({JSON.stringify({ description, query, params, hash })})</li>
        ) : null}
      </ul>
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

      const routerStore = localFluxServer.Store('/router', lifespan);

      localFluxServer.Action('/router/navigate', lifespan)
      .onDispatch(({ url }) => {
        if(__NODE__) {
          return routerStore.set('routes', App.getRoutes({ url })).commit();
        }
        if(__BROWSER__) {
          return window.history.pushState(null, null, url);
        }
      });

      if(__BROWSER__) {
        function updateMetaTags() {
          const { title, description } = App.getMeta({ window });
          const titleTag = window.document.getElementsByTagName('title')[0];
          if(titleTag) {
            titleTag.textContent = title;
          }
          if(window.document.querySelector) {
            const descriptionTag = window.document.querySelector('meta[name=description]');
            if(descriptionTag) {
              descriptionTag.textContent = description;
            }
          }
        }

        const ln = () => {
          updateMetaTags();
          routerStore.set('routes', App.getRoutes({ window })).commit();
        };
        window.addEventListener('popstate', ln);
        lifespan.onRelease(() => window.removeEventListener('popstate', ln));
        updateMetaTags();
      }

      routerStore.set('routes', App.getRoutes({ req, window })).commit();

      return nexus;
    },

    getMeta({ req, window }) {
      return App.getRoutes({ req, window })[0];
    },
  },
});

export default App;
