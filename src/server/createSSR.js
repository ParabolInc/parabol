import {createStore, applyMiddleware} from 'redux';
import makeReducer from 'universal/redux/makeReducer';
import {match} from 'react-router';
import thunkMiddleware from 'redux-thunk';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Html from './Html';
const metaAndTitle = `
  <meta charSet="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="description" content="Team transparency, made easy."/>
  <title>Action | Parabol Inc</title>
`;

export default function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), {});
  if (process.env.NODE_ENV === 'production') {
    // TURN ON IF WE EVER SEND DOMAIN STATE STATE TO CLIENT
    // eslint-disable-next-line global-require
    const makeRoutes = require('../../build/prerender').default;
    // eslint-disable-next-line global-require
    // get the same StyleSheetServer that the universal uses
    const {cashay, cashaySchema, StyleSheetServer} = require('../../build/prerender');
    // eslint-disable-next-line global-require
    const assets = require('../../build/assets.json');
    cashay.create({
      store,
      schema: cashaySchema,
      httpTransport: {}
    });
    const routes = makeRoutes(store);
    match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        const {entries} = assets;
        const htmlString = renderToStaticMarkup(
          <Html store={store} entries={entries} StyleSheetServer={StyleSheetServer} renderProps={renderProps}/>
        );
        res.send(`<!DOCTYPE html>${htmlString}`.replace('<head>', `<head>${metaAndTitle}`));
      } else {
        res.status(404).send('Not found');
      }
    });
  } else {
    const devHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="/static/css/font-awesome.css"/>
    </head>
    <body>
      <div id="root"></div>
      <script src="/static/app.js"></script>
    </body>
    </html>
    `;
    res.send(devHtml.replace('<head>', `<head>${metaAndTitle}`));
  }
}
