import Lifespan from 'lifespan';
import { React, Mixin } from 'react-nexus';
import Local from 'nexus-flux/adapters/Local';
import SocketClient from 'nexus-flux-socket.io/client';

const App = React.createClass({
  mixins: [Mixin],

  render() {

  },

  statics: {
    createNexus({ req, window }, lifespan) {
      const localFluxServer = new Local.Server();
      const local = new Local.Client(localFluxServer);
      const remote = new SocketClient('http://localhost:8080');
      lifespan.onRelease(() => {
        localFluxServer.release();
        local.release();
        remote.release();
      };
      lifespan.onRelease(localFluxServer.release);
      if(req) {
        if(__DEV__) {
          __NODE__.should.be.true;
        }
      }
      if(window) {
        if(__DEV__) {
          __BROWSER__.should.be.true;
        }
      }
      return { local, remote };
    },

    getTitle(url) {

    },
  },
});

export default App;
