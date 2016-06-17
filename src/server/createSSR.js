import {createStore, applyMiddleware} from 'redux';
import makeReducer from '../universal/redux/makeReducer';
import {match} from 'react-router';
import thunkMiddleware from 'redux-thunk';
import {Map as iMap} from 'immutable';

export default function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), iMap());
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line global-require
    const routesOrPrerender = require('../../build/prerender');
    const makeRoutes = routesOrPrerender('routes');
    // eslint-disable-next-line global-require
    const assets = require('../../build/assets.json');
    const routes = makeRoutes(store);
    match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        // So hacky i'm almost proud of it
        routesOrPrerender()(req, res, store, assets.entries, renderProps);
      } else {
        res.status(404).send('Not found');
      }
    });
  } else {
    // just send a cheap html doc + stringified store
    // eslint-disable-next-line global-require
    const routesOrPrerender = require('./routesOrPrerender');
    routesOrPrerender()(req, res, store);
  }
}
