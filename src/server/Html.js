/* eslint react/no-danger:0 */
import React, {PropTypes} from 'react';
import { LookRoot } from 'react-look';
import {Provider} from 'react-redux';
import {RouterContext} from 'react-router';
import {renderToString} from 'react-dom/server';

// Injects the server rendered state and app into a basic html template
export default function Html({
  store,
  title,
  lookConfig,
  lookCSSToken,
  assets,
  renderProps
}) {
  const PROD = process.env.NODE_ENV === 'production';
  const {manifest, app, vendor} = assets || {};
  const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())}`;

  const root = PROD && renderToString(
    <LookRoot config={lookConfig}>
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>
    </LookRoot>
  );

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="description" content="Team transparency, made easy." />
        <style dangerouslySetInnerHTML={{__html: lookCSSToken}} id={lookConfig.styleElementId} />
        <title>{title}</title>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{__html: initialState}} />
        {PROD ?
          <div id="root" dangerouslySetInnerHTML={{__html: root}}></div> :
          <div id="root"></div>}
        {PROD && <script dangerouslySetInnerHTML={{__html: manifest.text}} />}
        {PROD && <script src={vendor.js} />}
        <script src={PROD ? app.js : '/static/app.js'} />
      </body>
    </html>
  );
}

Html.propTypes = {
  store: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  lookConfig: PropTypes.object.isRequired,
  lookCSSToken: PropTypes.string.isRequired,
  assets: PropTypes.object,
  renderProps: PropTypes.object
};
