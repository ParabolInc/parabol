import {render} from 'react-dom';
import React from 'react';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import makeStore from './makeStore';
import Root from './Root';
import {StyleSheet} from 'aphrodite-local-styles/no-important';
import cashaySchema from 'cashay!../server/utils/getCashaySchema.js';

// const {routing} = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle
const initialState = {};


(async() => {
  const store = await makeStore(initialState);
  // Create the Cashay singleton:
  const persistedToken = store.getState().auth.token;
  cashay.create({
    store,
    schema: cashaySchema,
    httpTransport: new ActionHTTPTransport(persistedToken)
  });
  if (__PRODUCTION__) {
    /*
     * During the production client bundle build, the server will need to be
     * stopped.
     */
    // eslint-disable-next-line no-underscore-dangle
    StyleSheet.rehydrate(window.__APHRODITE__);
    render(
      <Root store={store}/>,
      document.getElementById('root')
    );
  } else {
    /*
     * Hey! We're the server. No need to stop rethink. The server will
     * take care of that when it wants to exit.
     */
    // eslint-disable-next-line global-require
    const {AppContainer} = require('react-hot-loader');
    // ENABLE THIS FOR EXPLORING FRONT END PERFORMANCE
    // const {whyDidYouUpdate} = require('why-did-you-update');
    // whyDidYouUpdate(React);
    render(
      <AppContainer>
        <Root store={store}/>
      </AppContainer>,
      document.getElementById('root')
    );

    if (module.hot) {
      /* eslint-disable global-require, no-shadow */
      module.hot.accept('./Root', () => {
        const Root = require('./Root');
        render(
          <AppContainer>
            <Root store={store}/>
          </AppContainer>,
          document.getElementById('root')
        );
        /* eslint-enable global-require */
      });
    }
  }
})();
