import {useEffect} from 'react'
import {isBrowserTooOld, UPDATE_BROWSER_URL} from '../utils/browserSupport'
import useAtmosphere from './useAtmosphere'

const useOldBrowserSnack = () => {
  const atmosphere = useAtmosphere()
  useEffect(() => {
    if (!isBrowserTooOld) return
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'oldBrowser',
      message: 'Your browser is too old, so parts of Parabol won’t work. Update it to fix this.',
      autoDismiss: 10,
      showDismissButton: true,
      action: {
        label: 'Update',
        callback: () => window.open(UPDATE_BROWSER_URL, '_blank', 'noreferrer')
      }
    })
  }, [atmosphere])
}

export default useOldBrowserSnack
