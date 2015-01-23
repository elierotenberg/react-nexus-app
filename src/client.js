import Lifespan from 'lifespan';
import Nexus from 'react-nexus';

import AppClass from './components/App';

const { React } = Nexus;
const App = React.createFactory(AppClass);
const INT_MAX = 9007199254740992;

const lifespan = new Lifespan();
Nexus.mountApp(App(),
  AppClass.createNexus({ window }, window.reactNexusClientID || _.uniqueId(`Client${_.random(1, INT_MAX - 1)}`), lifespan),
  window.reactNexusData || {},
  document.getElementById('app-root')
);
window.addEventListener('close', lifespan.release);
