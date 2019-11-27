import Atmosphere from '../../Atmosphere'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import {APP_TOKEN_KEY} from '../../utils/constants'
import {SegmentClientEventEnum} from '../../types/graphql'

const signout = (atmosphere: Atmosphere, history: any) => {
  window.localStorage.removeItem(APP_TOKEN_KEY)
  SendClientSegmentEventMutation(atmosphere, SegmentClientEventEnum.UserLogout)
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
