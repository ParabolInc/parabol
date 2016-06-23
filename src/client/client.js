import {render} from 'react-dom';
import React from 'react';
import {AppContainer} from 'react-hot-loader';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import makeStore from './makeStore';
import Root from './Root';
import {persistStore} from 'redux-persist';
import getAuth from 'universal/redux/getAuth';
import cashayPersistTransform from './cashayPersistTransform';

const {routing} = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle

const initialState = {
  routing
};

const store = makeStore(initialState);

// Create the Cashay singleton:
let cashaySchema = null;
if (__CLIENT__ && __PRODUCTION__) {
  /*
   * During the production client bundle build, the server will need to be
   * stopped.
   */
  // eslint-disable-next-line global-require
  cashaySchema = require('cashay!../server/utils/getCashaySchema.js?stopRethink');
} else {
  /*
   * Hey! We're the server. No need to stop rethink. The server will
   * take care of that when it wants to exit.
   */
  // eslint-disable-next-line global-require
  cashaySchema = require('cashay!../server/utils/getCashaySchema.js');
}

persistStore(store, {blacklist: ['routing'], transforms: [cashayPersistTransform]}, () => {
  // don't include a transport so getAuth doesn't send a request to the server
  cashay.create({
    store,
    schema: cashaySchema
  });
  const auth = getAuth();
  // authToken is undefined if this is a first-time visit or token expired
  cashay.create({transport: new ActionHTTPTransport(auth.authToken)});
  render(
    <AppContainer>
      <Root store={store}/>
    </AppContainer>,
    document.getElementById('root')
  );
});


// Hot Module Replacement API
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
