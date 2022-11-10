import {RouterProps} from 'react-router'
import Atmosphere from '../Atmosphere'
import {LocalStorageKey, TrebuchetCloseReason} from '../types/constEnums'

export const closeMessages = {
  [TrebuchetCloseReason.SESSION_INVALIDATED]: 'You’ve been logged out from another device',
  [TrebuchetCloseReason.EXPIRED_SESSION]: 'Your session expired. Please log in'
}

const handleInvalidatedSession = (
  reason: TrebuchetCloseReason | undefined,
  {atmosphere, history}: {atmosphere: Atmosphere; history?: RouterProps['history']}
) => {
  const message = closeMessages[reason!]
  if (message) {
    window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'logOutJWT',
      message,
      autoDismiss: 5
    })
    setTimeout(() => {
      atmosphere.close()
      history?.replace('/')
    })
  }
}

export default handleInvalidatedSession
