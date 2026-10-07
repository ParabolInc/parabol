import {useEffect, useRef} from 'react'
import {useLocation} from 'react-router'
import useAtmosphere from './useAtmosphere'

const useServiceWorkerUpdater = () => {
  const atmosphere = useAtmosphere()
  // A page that loaded without a controller gets claimed by the first service worker, which cached the sources it already runs
  const isFirstServiceWorkerRef = useRef(
    'serviceWorker' in navigator && !navigator.serviceWorker.controller
  )
  const sourcesAreDirtyRef = useRef(false)

  const location = useLocation()

  useEffect(() => {
    const onServiceWorkerChange = () => {
      if (isFirstServiceWorkerRef.current) {
        isFirstServiceWorkerRef.current = false
        return
      }
      // new service worker means new sources
      sourcesAreDirtyRef.current = true
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'newVersion',
        autoDismiss: 5,
        message: 'A new version of Parabol is available 🎉',
        action: {
          label: `See what's changed`,
          callback: () => {
            const url = `https://github.com/ParabolInc/parabol/releases/tag/v${__APP_VERSION__}`
            window.open(url, '_blank', 'noopener')?.focus()
          }
        }
      })
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onServiceWorkerChange)
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', onServiceWorkerChange)
      }
    }
    return
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
