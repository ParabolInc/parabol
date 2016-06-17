import {render} from 'react-dom';
import React from 'react';
import {AppContainer} from 'react-hot-loader';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import makeStore from './makeStore';
import Root from './Root';
import {persistStore} from 'redux-persist';

const {routing} = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle

const initialState = {
  routing
};

const store = makeStore(initialState);

// Create the Cashay singleton:
// let cashaySchema = null;
// if (__CLIENT__) {
//   /*
//    * During the client bundle build, the server will need to be stopped:
//    */
//   // eslint-disable-next-line global-require
//   cashaySchema = require('cashay!../server/utils/getCashaySchema.js?stopRethink');
// } else {
//   /*
//    * Hey! We're the server. No need to stop rethink. The server will
//    * take care of that when it wants to exit.
//    */
//   // eslint-disable-next-line global-require
//   cashaySchema = require('cashay!../server/utils/getCashaySchema.js');
// }
const cashaySchema = require('cashay!../server/utils/getCashaySchema.js');

const cashayHttpTransport = new ActionHTTPTransport();

cashay.create({
  store,
  schema: cashaySchema,
  transport: cashayHttpTransport
});

persistStore(store, {}, () => {
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
