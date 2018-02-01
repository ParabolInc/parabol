import {StyleSheet} from 'aphrodite-local-styles/no-important';
import React from 'react';
import {render} from 'react-dom';
import makeStore from './makeStore';
import Root from './Root';
import './scrollIntoViewIfNeeded';

const initialState = {};
(async () => {
  const store = await makeStore(initialState);
  if (__PRODUCTION__) {
    StyleSheet.rehydrate(window.__APHRODITE__);
    render(
      <Root store={store} />,
      document.getElementById('root')
    );
  } else {
    // eslint-disable-next-line global-require
    const {AppContainer} = require('react-hot-loader'); // eslint-disable-line import/no-extraneous-dependencies
    render(
      <AppContainer>
        <Root store={store} />
      </AppContainer>,
      document.getElementById('root')
    );

    if (module.hot) {
      /* eslint-disable global-require, no-shadow */
      module.hot.accept('./Root', () => {
        const Root = require('./Root').default;
        render(
          <AppContainer>
            <Root store={store} />
          </AppContainer>,
          document.getElementById('root')
        );
        /* eslint-enable global-require */
      });
    }
  }
})();
