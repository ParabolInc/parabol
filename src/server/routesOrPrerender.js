import {Presets, Plugins, StyleSheet} from 'react-look';
import {push} from 'react-router-redux';
import {renderToStaticMarkup} from 'react-dom/server';
import routes from '../universal/routes/index';
import Html from './Html';
import React from 'react';
import {cashay} from 'cashay';
import ActionHTTPTransport from '../universal/utils/ActionHTTPTransport';

const PROD = process.env.NODE_ENV === 'production';

export default option => {
  if (option === 'routes') return routes;
  return function renderApp(req, res, store, entries = {}, renderProps) {
    const location = renderProps && renderProps.location && renderProps.location.pathname || '/';
    store.dispatch(push(location));
    const lookConfig = Presets['react-dom'];
    lookConfig.userAgent = req.headers['user-agent'];
    if (PROD) {
      // eslint-disable-next-line global-require
      const cashaySchema = require('cashay!./utils/getCashaySchema.js');
      const cashayHttpTransport = new ActionHTTPTransport();
      cashay.create({
        store,
        schema: cashaySchema,
        transport: cashayHttpTransport,
      });
    } else {
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
        entries={entries}
        renderProps={renderProps}
      />
    );
    const appCSS = StyleSheet.renderToString(lookConfig.prefixer);
    res.send(`<!DOCTYPE html>${htmlString.replace(lookCSSToken, appCSS)}`);
  };
};
