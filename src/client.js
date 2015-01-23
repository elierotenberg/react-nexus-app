import Lifespan from 'lifespan';
import Nexus from 'react-nexus';

import AppClass from './components/App';

const { React } = Nexus;
const App = React.createFactory(AppClass);

const data = window.reactNexusData || {};
Nexus.mountApp(App(),
  AppClass.createNexus({ window }, new Lifespan()),
  window.reactNexusData || {},
  document.getElementById('app-root')
);
