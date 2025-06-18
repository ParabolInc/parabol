import {useEffect, useRef} from 'react'
import {useLocation} from 'react-router'
import useAtmosphere from './useAtmosphere'

const useServiceWorkerUpdater = () => {
  const atmosphere = useAtmosphere()
  const isFirstServiceWorkerRef = useRef(true)
  const sourcesAreDirtyRef = useRef(false)

  const location = useLocation()

  useEffect(() => {
    const setFirstServiceWorker = async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      isFirstServiceWorkerRef.current = !registration
    }
    const onServiceWorkerChange = () => {
      if (isFirstServiceWorkerRef.current) {
        isFirstServiceWorkerRef.current = false
        return
      }
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
      sourcesAreDirtyRef.current = true
    }
    if ('serviceWorker' in navigator) {
      setFirstServiceWorker().catch(() => {
        /*ignore*/
      })
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
      sourcesAreDirtyRef.current = false
      window.location.reload()
    }
  }, [location.pathname])
}
export default useServiceWorkerUpdater
