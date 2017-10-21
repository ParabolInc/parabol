import {StyleSheet} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import cashaySchema from 'cashay!../server/utils/getCashaySchema.js'; // eslint-disable-line
import Atmosphere from 'universal/Atmosphere';
import React from 'react';
import {render} from 'react-dom';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import makeStore from './makeStore';
import Root from './Root';

// const {routing} = window.__INITIAL_STATE__;
const initialState = {};

(async () => {
  const store = await makeStore(initialState);
  // Create the Cashay singleton:
  const persistedToken = store.getState().auth.token;
  cashay.create({
    store,
    schema: cashaySchema,
    httpTransport: new ActionHTTPTransport(persistedToken)
  });

  // Relay store
  const atmosphere = new Atmosphere();

  if (__PRODUCTION__) {
    StyleSheet.rehydrate(window.__APHRODITE__);
    render(
      <Root atmosphere={atmosphere} store={store} />,
      document.getElementById('root')
    );
  } else {
    // eslint-disable-next-line global-require
    const {AppContainer} = require('react-hot-loader'); // eslint-disable-line import/no-extraneous-dependencies
    render(
      <AppContainer>
        <Root atmosphere={atmosphere} store={store} />
      </AppContainer>,
      document.getElementById('root')
    );

    if (module.hot) {
      /* eslint-disable global-require, no-shadow */
      module.hot.accept('./Root', () => {
        const Root = require('./Root').default;
        render(
          <AppContainer>
            <Root atmosphere={atmosphere} store={store} />
          </AppContainer>,
          document.getElementById('root')
        );
        /* eslint-enable global-require */
      });
    }
  }
})();
