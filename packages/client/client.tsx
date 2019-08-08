import './cdnFallback'
import React from 'react'
import {render} from 'react-dom'
import makeStore from './makeStore'
import Root from './Root'
import './scrollIntoViewIfNeeded'
// do this here so useBuiltIns can replace it with only the polyfills required to hit browser targets
import 'core-js/stable'
import 'regenerator-runtime/runtime'


const initialState = {}
export const store = makeStore(initialState)
render(<Root store={store} />, document.getElementById('root'))

if ((module as any).hot) {
  (module as any).hot.accept('./Root', () => {
    const Root = require('./Root').default
    render(<Root store={store} />, document.getElementById('root'))
  })
}

if (__PRODUCTION__ && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    navigator.serviceWorker.register('/static/sw.js', {scope: '/'}).catch(console.error)
  })
}

// window.addEventListener('beforeinstallprompt', (e) => {
//   // Stash the event so it can be triggered later.
//   console.log("ready to install")
//   // call e.prompt() somewhere
//   e.userChoice
//     .then((choiceResult) => {
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the A2HS prompt');
//       } else {
//         console.log('User dismissed the A2HS prompt');
//       }
//       e = null;
//     });
// });
//
// window.addEventListener('appinstalled', (evt) => {
//   console.log('a2hs installed');
// });
