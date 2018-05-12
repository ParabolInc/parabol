import React from 'react';
import {render} from 'react-dom';
import makeStore from './makeStore';
import Root from './Root';
import './scrollIntoViewIfNeeded';
import {hydrate} from 'emotion';

const initialState = {};
const store = makeStore(initialState);

if (__PRODUCTION__) {
  hydrate(window.__EMOTION__);
}
render(<Root store={store} />, document.getElementById('root'));

/*
 * react-hot-loader currently doesn't support React 16.3, so we'll need to disable it for now
 * We'll revisit this when we up our babel game #1762
 */

// eslint-disable-next-line global-require
// const {AppContainer} = require('react-hot-loader'); // eslint-disable-line import/no-extraneous-dependencies
// render(
// {/*<Root store={store} />,*/}
// document.getElementById('root')
// );

// if (module.hot) {
/* eslint-disable global-require, no-shadow */
// module.hot.accept('./Root', () => {
//   const Root = require('./Root').default;
//   render(
//     <AppContainer>
//       <Root store={store} />
//     </AppContainer>,
//     document.getElementById('root')
//   );
//   /* eslint-enable global-require */
// });
// }
