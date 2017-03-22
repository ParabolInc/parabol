import {createStore, applyMiddleware} from 'redux';
import makeReducer from 'universal/redux/makeReducer';
import {match} from 'react-router';
import thunkMiddleware from 'redux-thunk';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Html from './Html';
import printStyles from 'universal/styles/theme/printStyles';

const metaAndTitle = `
  <meta charSet="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="description" content="Team transparency, made easy."/>
  <title>Action | Parabol Inc</title>
  <style>${printStyles}</style>
`;

export default function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), {});
  if (process.env.NODE_ENV === 'production') {
    /* eslint-disable global-require */
    const makeRoutes = require('../../build/prerender').default;
    // get the same StyleSheetServer that the universal uses
    const {cashay, cashaySchema, StyleSheetServer} = require('../../build/prerender');
    const assets = require('../../build/assets.json');
    /* eslint-enable */
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
        const htmlString = renderToStaticMarkup(
          <Html store={store} assets={assets} StyleSheetServer={StyleSheetServer} renderProps={renderProps} />
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
      <script src="/static/vendors.dll.js"></script>
      <script src="/static/app.js"></script>
    </body>
    </html>
    `;
    res.send(devHtml.replace('<head>', `<head>${metaAndTitle}`));
  }
}
