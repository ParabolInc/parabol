/* eslint react/no-danger:0 */
import PropTypes from 'prop-types';
import React from 'react';
import {Provider} from 'react-redux';
import {renderToString} from 'react-dom/server';
import makeSegmentSnippet from '@segment/snippet';
import getWebpackPublicPath from 'server/utils/getWebpackPublicPath';
import {StaticRouter} from 'react-router';
import AtmosphereProvider from '../universal/components/AtmosphereProvider/AtmosphereProvider';

const webpackPublicPath = getWebpackPublicPath();
const segKey = process.env.SEGMENT_WRITE_KEY;
const segmentSnippet = segKey && makeSegmentSnippet.min({
  host: 'cdn.segment.com',
  apiKey: segKey
});

// Injects the server rendered state and app into a basic html template
export default function Html({store, assets, clientKeyLoader}) {
  // const ActionContainer = require('../../build/prerender');
  const {default: ActionContainer, Atmosphere, StyleSheetServer} = require('../../build/prerender');
  const {manifest, app, vendor} = assets;
  // TURN ON WHEN WE SEND STATE TO CLIENT
  // const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())}`;
  // <script dangerouslySetInnerHTML={{__html: initialState}}/>
  const context = {};
  const atmosphere = new Atmosphere();
  const {html, css} = StyleSheetServer.renderStatic(() => {
    try {
      return renderToString(
        <Provider store={store}>
          <AtmosphereProvider atmosphere={atmosphere}>
            <StaticRouter location={'/'} context={context}>
              <ActionContainer />
            </StaticRouter>
          </AtmosphereProvider>
        </Provider>
      );
    } catch (e) {
      console.log(`SSR exception: ${e}`);
      console.trace();
      return '<div>Error during render!</div>';
    }
  });
  const dehydratedStyles = `window.__APHRODITE__ = ${JSON.stringify(css.renderedClassNames)}`;
  const fontAwesomeUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
  return (
    <html>
      <head>
        <style data-aphrodite dangerouslySetInnerHTML={{__html: css.content}} />
        <link rel="stylesheet" type="text/css" href={fontAwesomeUrl} />
        {/* segment.io analytics */}
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: segmentSnippet}} />
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{__html: html}} />
        <script dangerouslySetInnerHTML={{__html: dehydratedStyles}} />
        <script dangerouslySetInnerHTML={{__html: clientKeyLoader}} />
        <script dangerouslySetInnerHTML={{__html: manifest.text}} />
        <script src={`${webpackPublicPath}${vendor.js}`} />
        <script src={`${webpackPublicPath}${app.js}`} />
      </body>
    </html>
  );
}

Html.propTypes = {
  clientKeyLoader: PropTypes.string.isRequired,
  store: PropTypes.object.isRequired,
  assets: PropTypes.object
};
