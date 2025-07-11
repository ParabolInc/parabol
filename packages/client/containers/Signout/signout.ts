import Atmosphere from '../../Atmosphere'
import SendClientSideEvent from '../../utils/SendClientSideEvent'

const signout = (atmosphere: Atmosphere, history: any) => {
  atmosphere.setAuthToken(null)
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
