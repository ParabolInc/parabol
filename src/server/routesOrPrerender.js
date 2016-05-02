import {Presets, Plugins, StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import {renderToStaticMarkup} from 'react-dom/server';
import routes from '../universal/routes/index';
import Html from './Html';
import React from 'react';

const PROD = process.env.NODE_ENV === 'production';

export default option => {
  if (option === 'routes') return routes;
  return function renderApp(req, res, store, assets, renderProps) {
    const location = renderProps && renderProps.location && renderProps.location.pathname || '/';
    store.dispatch(push(location));
    const lookConfig = Presets['react-dom'];
    lookConfig.userAgent = req.headers['user-agent'];
    if (!PROD) {
      lookConfig.plugins.push(Plugins.friendlyClassName);
    }
    lookConfig.styleElementId = '_look';
    // Needed so some components can render based on location
    const lookCSSToken = '<!-- appCSS -->';
    const htmlString = renderToStaticMarkup(
      <Html
        title="Action | Parabol Inc"
        lookConfig={lookConfig}
        lookCSSToken={lookCSSToken}
        store={store}
        assets={assets}
        renderProps={renderProps}
      />
    );
    const appCSS = StyleSheet.renderToString(lookConfig.prefixer);
    res.send(`<!DOCTYPE html>${htmlString.replace(lookCSSToken, appCSS)}`);
  };
};
