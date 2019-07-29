import './cdnFallback'
import React from 'react'
import {render} from 'react-dom'
import makeStore from './makeStore'
import Root from './Root'
import './scrollIntoViewIfNeeded'
// do this here so useBuiltIns can replace it with only the polyfills required to hit browser targets
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import * as Sentry from '@sentry/browser'

const dsn = window.__ACTION__.sentry
if (dsn) {
  Sentry.init({dsn})
}

const initialState = {}
export const store = makeStore(initialState)
render(<Root store={store} />, document.getElementById('root'))

if ((module as any).hot) {
  (module as any).hot.accept('./Root', () => {
    const Root = require('./Root').default
    render(<Root store={store} />, document.getElementById('root'))
  })
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('./sw.js').then(registration => {
//       console.log('SW registered: ', registration);
//     }).catch(registrationError => {
//       console.log('SW registration failed: ', registrationError);
//     });
//   });
// }
