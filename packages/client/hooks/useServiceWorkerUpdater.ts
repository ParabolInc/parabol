import {useEffect, useRef} from 'react'
import useAtmosphere from './useAtmosphere'

const useServiceWorkerUpdater = () => {
  const atmosphere = useAtmosphere()
  const isFirstServiceWorkerRef = useRef(true)
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
      const showCustomNotification =
        __APP_VERSION__ === window.__ACTION__.launchVersion &&
        window.__ACTION__.launchMessage &&
        window.__ACTION__.launchURL
      const message = showCustomNotification
        ? window.__ACTION__.launchMessage
        : 'A new version of Parabol is available 🎉'
      const label = showCustomNotification ? 'Check it out' : `See what's changed`
      const defaultUrl =
        'https://github.com/ParabolInc/parabol/blob/production/CHANGELOG.md#parabol-change-log'
      const url = showCustomNotification ? window.__ACTION__.launchURL : defaultUrl
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'newVersion',
        autoDismiss: 5,
        message,
        action: {
          label,
          callback: () => {
            window.open(url, '_blank', 'noopener')?.focus()
          }
        }
      })
    }
    if ('serviceWorker' in navigator) {
      setFirstServiceWorker().catch()
      navigator.serviceWorker.addEventListener('controllerchange', onServiceWorkerChange)
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', onServiceWorkerChange)
      }
    }
    return
  }, [])
}
export default useServiceWorkerUpdater
