import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {applyMiddleware, createStore} from 'redux';
import thunkMiddleware from 'redux-thunk';
import makeSegmentSnippet from '@segment/snippet';
import getWebpackPublicPath from 'server/utils/getWebpackPublicPath';
import makeReducer from 'universal/redux/makeReducer';
import printStyles from 'universal/styles/theme/printStyles';
import Html from './Html';

const metaAndTitle = `
  <meta charSet="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta property="description" content="Team transparency, made easy."/>
  <title>Parabol</title>
  <style>${printStyles}</style>
`;

const clientIds = {
  auth0: process.env.AUTH0_CLIENT_ID,
  auth0Domain: process.env.AUTH0_DOMAIN,
  cdn: getWebpackPublicPath(),
  github: process.env.GITHUB_CLIENT_ID,
  sentry: process.env.SENTRY_DSN_PUBLIC,
  slack: process.env.SLACK_CLIENT_ID,
  stripe: process.env.STRIPE_PUBLISHABLE_KEY
};

const clientKeyLoader = `window.__ACTION__ = ${JSON.stringify(clientIds)}`;

let cachedPage;
export default function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), {});
  if (process.env.NODE_ENV === 'production') {
    if (!cachedPage) {
       // eslint-disable-next-line global-require
      const assets = require('../../build/assets.json');
      const htmlString = renderToStaticMarkup(<Html store={store} assets={assets} clientKeyLoader={clientKeyLoader} />);
      cachedPage = `<!DOCTYPE html>${htmlString}`.replace('<head>', `<head>${metaAndTitle}`);
    }
    res.send(cachedPage);
  } else {
    /*
     * When segment.io is configured during development, load the segment
     * snippet here. For production use, refer to the Html.js component.
     */
    const segKey = process.env.SEGMENT_WRITE_KEY;
    const segmentSnippet = segKey && `
    <script>
      ${makeSegmentSnippet.min({
        host: 'cdn.segment.com',
        apiKey: segKey
      })}
    </script>
    `;

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
      <script>${clientKeyLoader}</script>
      ${segmentSnippet}
    </body>
    </html>
    `;
    res.send(devHtml.replace('<head>', `<head>${metaAndTitle}`));
  }
}
