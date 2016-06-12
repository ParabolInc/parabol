import {render} from 'react-dom';
import React from 'react';
import { AppContainer } from 'react-hot-loader';
import {Map as iMap, fromJS} from 'immutable';
import {Cashay, HTTPTransport} from 'cashay';
import makeStore from './makeStore';
import Root from './Root';
import {getGraphQLUri} from 'universal/utils/graphQLConfig';
import {localStorageVars} from 'universal/utils/clientOptions';

const {auth, routing, form} = window.__INITIAL_STATE__; // eslint-disable-line no-underscore-dangle

// form & routing are currently regular JS objects. This may change in the future
const initialState = iMap([
  ['auth', fromJS(auth)],
  ['routing', routing],
  ['form', form]
]);

// Create the store:
const store = makeStore(initialState);

// Create the Cashay singleton:
const cashaySchema = require('cashay!../server/utils/getCashaySchema.babel.js');
const authToken = localStorage.getItem(localStorageVars.authTokenName);
const cashayHttpTransport = new HTTPTransport(
  getGraphQLUri(),
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    }
  }
);
const cashayParams = {
  store,
  schema: cashaySchema,
  getToState: reduxStore => reduxStore.getState().get('cashay'),
  transport: cashayHttpTransport
};

// export the Cashay singleton:
export const cashay = new Cashay(cashayParams);


render(
  <AppContainer>
    <Root store={store} />
  </AppContainer>,
  document.getElementById('root')
);

// Hot Module Replacement API
if (module.hot) {
  /* eslint-disable global-require, no-shadow */
  module.hot.accept('./Root', () => {
    const Root = require('./Root');
    render(
      <AppContainer>
        <Root store={store} />
      </AppContainer>,
      document.getElementById('root')
    );
  /* eslint-enable global-require */
  });
}
