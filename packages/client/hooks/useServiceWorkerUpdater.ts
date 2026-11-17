import {useEffect} from 'react'
import getServiceWorkerBuild from '../utils/getServiceWorkerBuild'

// A new service worker waits instead of replacing the old one as soon as it has installed,
// because Safari has killed the old one while a page was still loading its scripts through it
// Once this page has loaded, a worker from the same build is told to take over
// A worker from another build waits for a page of its own build, which useQuietUpdate loads
const useServiceWorkerUpdater = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), {once: true})
    })
    const onInstalled = async (worker: ServiceWorker) => {
      const {commitHash} = await getServiceWorkerBuild(worker)
      if (commitHash !== __COMMIT_HASH__) return
      await pageLoaded
      worker.postMessage({type: 'skipWaiting'})
    }
    const watchWorker = (worker: ServiceWorker | null) => {
      if (!worker) return
      if (worker.state === 'installed') {
        onInstalled(worker)
        return
      }
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') onInstalled(worker)
      })
    }
    // ready waits for the first worker to activate, which is registered after the page loads
    navigator.serviceWorker.ready.then((registration) => {
      watchWorker(registration.waiting)
      watchWorker(registration.installing)
      registration.addEventListener('updatefound', () => {
        watchWorker(registration.installing)
      })
    })
  }, [])
}
export default useServiceWorkerUpdater
