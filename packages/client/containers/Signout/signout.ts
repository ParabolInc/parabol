import Atmosphere from '../../Atmosphere'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import {APP_TOKEN_KEY} from '../../utils/constants'
import {SegmentClientEventEnum} from '../../types/graphql'

const signout = (atmosphere: Atmosphere, history: any) => {
  window.localStorage.removeItem(APP_TOKEN_KEY)
  SendClientSegmentEventMutation(atmosphere, SegmentClientEventEnum.UserLogout)
  /* reset the app state, but preserve any pending notifications: */
  if (history) {
    history.replace('/')
  }
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'logOut',
    message: 'You’ve been logged out successfully.',
    autoDismiss: 5
  })
  atmosphere.close()
}

export default signout
