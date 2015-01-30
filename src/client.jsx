import Lifespan from 'lifespan';
import Nexus from 'react-nexus';

import App from './components/App';

const { React } = Nexus;
const INT_MAX = 9007199254740992;
console.log('client.jsx', Date.now());

const lifespan = new Lifespan();
const nexus = App.createNexus({ window }, window.reactNexusClientID || _.uniqueId(`Client${_.random(1, INT_MAX - 1)}`), lifespan);
Nexus.mountApp(<App nexus={nexus} />, // pass nexus as a prop to make it accessible in the devtools
  nexus,
  window.reactNexusData || {},
  document.getElementById('app-root')
);
window.addEventListener('close', lifespan.release);
