import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import makeReducer from '../universal/redux/makeReducer';
import {match} from 'react-router';
import fs from 'fs';
import {join, basename} from 'path';
import promisify from 'es6-promisify';
import thunkMiddleware from 'redux-thunk';
import {Map as iMap} from 'immutable';

export default async function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), iMap());
  if (process.env.NODE_ENV === 'production') {
    const routesOrPrerender = require('../../build/prerender');
    const makeRoutes = routesOrPrerender('routes');
    const assets = require('../../build/assets.json');
    const readFile = promisify(fs.readFile);
    assets.manifest.text = await readFile(join(__dirname, '..', '..', 'build', basename(assets.manifest.js)), 'utf-8');
    const routes = makeRoutes(store);
    match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        // So hacky i'm almost proud of it
        routesOrPrerender()(req, res, store, assets, renderProps);
      } else {
        res.status(404).send('Not found');
      }
    });
  } else {
    // just send a cheap html doc + stringified store
    const routesOrPrerender = require('./routesOrPrerender');
    routesOrPrerender()(req, res, store);
  }
}
