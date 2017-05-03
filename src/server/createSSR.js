import {createStore, applyMiddleware} from 'redux';
import makeReducer from 'universal/redux/makeReducer';
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

let cachedPage;
export default function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), {});
  if (process.env.NODE_ENV === 'production') {
    if (!cachedPage) {
      /* eslint-disable global-require */
      const assets = require('../../build/assets.json');
      /* eslint-enable */
      const htmlString = renderToStaticMarkup(
        <Html store={store} assets={assets} />
      );
      cachedPage = `<!DOCTYPE html>${htmlString}`.replace('<head>', `<head>${metaAndTitle}`);
    }
    res.send(cachedPage);
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
