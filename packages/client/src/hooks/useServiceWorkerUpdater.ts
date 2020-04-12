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
        autoDismiss: 0,
        message: 'A new version of Parabol is available',
        action: {
          label: 'Refresh to upgrade',
          callback: () => {
            window.location.reload()
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
