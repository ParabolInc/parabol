import {useEffect} from 'react'
import {isOldBrowserError} from '../utils/errorFilters'
import {isError} from '../utils/reportClientError'
import showOldBrowserSnack from '../utils/showOldBrowserSnack'
import useAtmosphere from './useAtmosphere'

// An error boundary shows the fatal screen for what it catches. These are the errors the app keeps running through
const useOldBrowserSnack = () => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isOldBrowserError(event)) showOldBrowserSnack(atmosphere)
    }
    const onUnhandledRejection = ({reason}: PromiseRejectionEvent) => {
      if (isError(reason) && isOldBrowserError(reason)) showOldBrowserSnack(atmosphere)
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [atmosphere])
}

export default useOldBrowserSnack
