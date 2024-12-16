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
}
export default useServiceWorkerUpdater
