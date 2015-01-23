import express from 'express';
import Lifespan from 'lifespan';
import Nexus from 'react-nexus';

import AppClass from './components/App';

const { React } = Nexus;
const App = React.createFactory(AppClass);

express()
.use(express.static(__dirname + '/public'))
.get('*', (req, res) => {
  const lifespan = new Lifespan();
  const nexus = AppClass.createNexus({ req }, lifespan);
  Nexus.prerenderApp(App(), nexus)
  .then([html, data] => {
    lifespan.release();
    res.status(200).send(`
      <!doctyp html5>
      <html>
      <head>
      <title>${AppClass.getTitle(req.url)}</title>
      </head>
      <body>
        <div id='app-root'>${html}</div>
        <script>window.reactNexusData = JSON.parse(${JSON.stringify(data)});</script>
        <script src='c.js'></script>
      </body>
      </html>
    `);
  })
  .catch((err) => res.status(500).json({
    message: err.message,
    stack: __DEV__ ? err.stack : null,
  }));
})
.listen(8000);
