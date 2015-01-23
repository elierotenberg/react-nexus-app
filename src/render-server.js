import express from 'express';
import Lifespan from 'lifespan';
import Nexus from 'react-nexus';
import jsesc from 'jsesc';

import { render } from './config';
import AppClass from './components/App';

const { React } = Nexus;
const App = React.createFactory(AppClass);
const { port } = render;
const INT_MAX = 9007199254740992;

express()
.use(express.static(__dirname + '/public'))
.get('*', (req, res) => {
  const clientID = _.uniqueId(`Client${_.random(1, INT_MAX - 1)}`);
  const lifespan = new Lifespan();
  const nexus = AppClass.createNexus({ req }, clientID, lifespan);
  Nexus.prerenderApp(App(), nexus)
  .then(([html, data]) => {
    lifespan.release();
    const { title, description } = AppClass.getMeta({ req });
    res.status(200).send(`
      <!doctype html lang='en-US'>
      <html>
      <head>
        <meta charset='utf-8'>
        <meta charset='X-UA-Compatible' content='IE=edge'>
        <title>${jsesc(title)}</title>
        <meta name='description' content='${jsesc(description)}'>
        <link rel='stylesheet' href='c.css'>
        </head>
      <body>
        <div id='app-root'>${html}</div>
        <script src='//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js'></script>
        <script>
          window.reactNexusData = JSON.parse(${JSON.stringify(data)});
          window.reactNexusClientID = '${jsesc(clientID)}';</script>
        <script src='c.js'></script>
        <script>
          (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
          function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
          e=o.createElement(i);r=o.getElementsByTagName(i)[0];
          e.src='//www.google-analytics.com/analytics.js';
          r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
          ga('create','UA-XXXXX-X','auto');ga('send','pageview');
        </script>
      </body>
      </html>
    `);
  })
  .catch((err) => {
    res.status(500);
    if(__DEV__) {
      res.type('text/plain').send(err.stack);
    }
    else {
      res.json({ err: err.message });
    }
  });
})
.listen(port);

console.log('render-server listening on port', port);
