import {applyMiddleware, compose, createStore} from 'redux';
import ravenMiddleware from 'redux-raven-middleware';
import thunkMiddleware from 'redux-thunk';
import {createTracker} from 'redux-segment';
import makeReducer from 'universal/redux/makeReducer';
import {APP_VERSION_KEY} from 'universal/utils/constants';

export default (initialState) => {
  let store;
  const reducer = makeReducer();
  /*
   * Special action types, such as thunks, must be placed before
   * storageMiddleware so they can be properly interpreted:
   */
  const middlewares = [
    thunkMiddleware
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
    const devtoolsExt = global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__({maxAge: 50});
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
  return store;
};
