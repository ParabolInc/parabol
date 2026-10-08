import {useEffect, useRef} from 'react'
import {useLocation} from 'react-router'
import getServiceWorkerBuild from '../utils/getServiceWorkerBuild'
import useAtmosphere from './useAtmosphere'

// A new service worker waits instead of replacing the old one as soon as it has installed,
// because Safari has killed the old one while a page was still loading its scripts through it
// Once this page has loaded, a worker from the same build is told to take over
// A worker from any other build means a deploy happened after this page loaded
const useServiceWorkerUpdater = () => {
  const atmosphere = useAtmosphere()
  const sourcesAreDirtyRef = useRef(false)

  const location = useLocation()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const {serviceWorker} = navigator
    const onNewSources = (version = __APP_VERSION__) => {
      if (sourcesAreDirtyRef.current) return
      sourcesAreDirtyRef.current = true
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'newVersion',
        autoDismiss: 5,
        message: 'A new version of Parabol is available 🎉',
        action: {
          label: `See what's changed`,
          callback: () => {
            const url = `https://github.com/ParabolInc/parabol/releases/tag/v${version}`
            window.open(url, '_blank', 'noopener')?.focus()
          }
        }
      })
    }
    const pageLoaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve()
      else window.addEventListener('load', () => resolve(), {once: true})
    })
    const onInstalled = async (worker: ServiceWorker) => {
      const {commitHash, version} = await getServiceWorkerBuild(worker)
      if (commitHash === __COMMIT_HASH__) {
        await pageLoaded
        worker.postMessage({type: 'skipWaiting'})
      } else {
        onNewSources(version)
      }
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
    // Another tab can tell a worker to take over, too
    const onControllerChange = async () => {
      const {controller} = serviceWorker
      if (!controller) return
      const {commitHash, version} = await getServiceWorkerBuild(controller)
      if (commitHash !== __COMMIT_HASH__) onNewSources(version)
    }
    // ready waits for the first worker to activate, which is registered after the page loads
    serviceWorker.ready.then((registration) => {
      watchWorker(registration.waiting)
      watchWorker(registration.installing)
      registration.addEventListener('updatefound', () => {
        watchWorker(registration.installing)
      })
    })
    serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => {
      serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  useEffect(() => {
    // When the sources are dirty, we want to reload the page as soon as possible without too much interruption for the user.
    // Let's hide it in a navigation event.
    if (sourcesAreDirtyRef.current) {
      window.location.reload()
    }
  }, [location.pathname])
}
export default useServiceWorkerUpdater
