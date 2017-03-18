import {createStore, applyMiddleware, compose} from 'redux';
import ravenMiddleware from 'redux-raven-middleware';
import thunkMiddleware from 'redux-thunk';
import {createMiddleware, createLoader} from 'redux-storage-whitelist-fn';
import {createTracker} from 'redux-segment';
import createEngine from 'redux-storage-engine-localstorage';
import makeReducer from 'universal/redux/makeReducer';
import {APP_REDUX_KEY, APP_VERSION_KEY} from 'universal/utils/constants';

const storageWhitelist = (type) => {
  const whitelistPrefixes = ['@@auth', '@@cashay', '@@root'];
  for (let i = 0; i < whitelistPrefixes.length; i++) {
    const prefix = whitelistPrefixes[i];
    if (type.indexOf(prefix) !== -1) {
      return true;
    }
  }
  return false;
};

export default async (initialState) => {
  let store;
  const reducer = makeReducer();
  const engine = createEngine(APP_REDUX_KEY);
  const storageMiddleware = createMiddleware(engine, [], storageWhitelist);
  /*
   * Special action types, such as thunks, must be placed before
   * storageMiddleware so they can be properly interpreted:
   */
  const middlewares = [
    thunkMiddleware,
    storageMiddleware
  ];

  if (__PRODUCTION__) {
    // add Sentry error reporting:
    middlewares.unshift(ravenMiddleware(window.__ACTION__.sentry));
    const segmentMiddleware = createTracker();
    if (window.analytics) {
      middlewares.unshift(segmentMiddleware);
    } else {
      console.warn('segment analytics undefined in production?');
    }
    store = createStore(reducer, initialState, compose(applyMiddleware(...middlewares)));
  } else {
    const devtoolsExt = global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__({ maxAge: 50 });
    if (!devtoolsExt) {
      // We don't have the Redux extension in the browser, show the Redux logger
      const createLogger = require('redux-logger'); // eslint-disable-line global-require
      const logger = createLogger({
        level: 'info',
        collapsed: true
      });
      middlewares.push(logger);
    }
    store = createStore(reducer, initialState, compose(
      applyMiddleware(...middlewares),
      devtoolsExt || ((f) => f),
    ));
  }
  const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);

  if (__APP_VERSION__ !== versionInStorage) { // eslint-disable-line no-undef
    window.localStorage.setItem(APP_VERSION_KEY, __APP_VERSION__); // eslint-disable-line no-undef
    return store;
  }
  const load = createLoader(engine);
  await load(store);
  return store;
};
