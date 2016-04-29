import {Presets, Plugins, StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import {renderToStaticMarkup} from 'react-dom/server';
import routes from '../universal/routes/index';
import Html from './Html';
import React from 'react'

export default option => {
  if (option === 'routes') return routes;
  return function renderApp(req, res, store, assets, renderProps) {
    const location = renderProps && renderProps.location && renderProps.location.pathname || '/';
    const lookConfig = Presets['react-dom'];
    // Needed so some components can render based on location
    store.dispatch(push(location));
    lookConfig.userAgent = req.headers['user-agent'];
    lookConfig.styleElementId = '_look';
    const lookCSSToken = '<!-- appCSS -->';
    const htmlString = renderToStaticMarkup(
      <Html
        title='Action | Parabol Inc'
        lookConfig={lookConfig}
        lookCSSToken={lookCSSToken}
        store={store}
        assets={assets}
        renderProps={renderProps}
      />
    );
    const appCSS = StyleSheet.renderToString(lookConfig.prefixer);
    res.send('<!DOCTYPE html>' + htmlString.replace(lookCSSToken, appCSS));
  }
}
