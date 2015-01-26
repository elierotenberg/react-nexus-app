import express from 'express';
import favicon from 'serve-favicon';
import Lifespan from 'lifespan';
import Nexus from 'react-nexus';
import jsesc from 'jsesc';

import { render, analytics } from './config';
import App from './components/App';

const { React } = Nexus;
const { port } = render;
const INT_MAX = 9007199254740992;

express()
.use(favicon(__dirname + '/public/favicon.ico'))
.use(express.static(__dirname + '/public'))
.get('*', (req, res) => {
  const clientID = _.uniqueId(`Client${_.random(1, INT_MAX - 1)}`);
  const lifespan = new Lifespan();
  const nexus = App.createNexus({ req }, clientID, lifespan);
  Nexus.prerenderApp(<App nexus={nexus} />, nexus) // pass nexus as a prop to make it visible in the devtools
  .then(([html, data]) => {
    lifespan.release();
    const { title, description } = App.getRoutes({ req })[0];
    res.status(200).send(`<!doctype html lang='en-US'>
<html>
<head>
  <meta charset='utf-8'>
  <meta charset='X-UA-Compatible' content='IE=edge'>
  <title>${jsesc(title)}</title>
  <meta name='description' content='${jsesc(description)}'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <link rel='icon' href='/favicon.ico' type='image/x-icon'>
  <link rel='stylesheet' href='/normalize.min.css'>
  <link rel='stylesheet' href='/c.css'>
  </head>
<body>
  <div id='app-root'>${html}</div>
  <script src='/json2.min.js'></script>
  <script>
    window.reactNexusData = JSON.parse('${jsesc(JSON.stringify(data))}');
    window.reactNexusClientID = '${jsesc(clientID)}';</script>
  <script src='/c.js'></script>
  <script>
    (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
    function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
    e=o.createElement(i);r=o.getElementsByTagName(i)[0];
    e.src='//www.google-analytics.com/analytics.js';
    r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
    ga('create','${jsesc(analytics.UA)}','auto');ga('send','pageview');
  </script>
</body>
</html>`);
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
