import {createRoot} from 'react-dom/client'
import Root from './Root'
import appRouter from './routing/appRouter'
import './scrollIntoViewIfNeeded'
import registerClientErrorHandlers from './utils/registerClientErrorHandlers'
import retryChunkLoadErrorOnce from './utils/retryChunkLoadErrorOnce'

registerClientErrorHandlers()
retryChunkLoadErrorOnce()
// The first page's loaders start its queries & chunks before React renders anything
appRouter.load({sync: true}).catch(console.error)
const container = document.getElementById('root')!
createRoot(container).render(<Root />)
// Browsers refuse a service worker from a self-signed certificate & log an error on every page load,
// so in development the worker is only registered when the dev server runs over http
const canRegisterServiceWorker = __PRODUCTION__ || window.location.protocol === 'http:'
// The browser refuses a worker to a document it is discarding, such as a sign-in popup its opener just closed,
// and to a site whose data the user blocks. The page works without one
const REFUSED_REGISTRATION_ERRORS = ['InvalidStateError', 'NotSupportedError']
// A proxy such as Google Translate serves a copy of the page from its own origin under a <base href> to the app's,
// and the browser refuses a worker from an origin other than the page's
const isServiceWorkerSameOrigin =
  new URL('/sw.js', document.baseURI).origin === window.location.origin
if (canRegisterServiceWorker && isServiceWorkerSameOrigin && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // logging from a closure keeps a frame of the app's own beneath console.error, which tells it from an extension's log
    navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch((error) => {
      if (!REFUSED_REGISTRATION_ERRORS.includes(error?.name)) console.error(error)
    })
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
