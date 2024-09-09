import Atmosphere from '../../Atmosphere'
import {LocalStorageKey} from '../../types/constEnums'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

const signout = (atmosphere: Atmosphere, history: any) => {
  window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
  SendClientSideEvent(atmosphere, 'User Logout')
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'logOut',
    message: 'You’ve been logged out successfully.',
    autoDismiss: 5
  })
  setTimeout(() => {
    atmosphere.close()
    history.replace('/')
  })
}

export default signout
