import type Atmosphere from '../Atmosphere'
import {UPDATE_BROWSER_URL} from './errorFilters'

// An error the app survives can repeat on every navigation, so the snack shows once per page load
let isShown = false

const showOldBrowserSnack = (atmosphere: Atmosphere) => {
  if (isShown) return
  isShown = true
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
}

export default showOldBrowserSnack
