import Atmosphere from '../../Atmosphere'
import SendClientSegmentEventMutation from '../../mutations/SendClientSegmentEventMutation'
import {reset as resetAppState} from '../../redux/rootDuck'
import {APP_TOKEN_KEY} from '../../utils/constants'
import {SegmentClientEventEnum} from '../../types/graphql'

const signout = (atmosphere: Atmosphere, dispatch: any, history: any) => {
  window.localStorage.removeItem(APP_TOKEN_KEY)
  SendClientSegmentEventMutation(atmosphere, SegmentClientEventEnum.UserLogout)
  /* reset the app state, but preserve any pending notifications: */
  if (history) {
    history.replace('/')
  }
  dispatch && dispatch(resetAppState())
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'logOut',
    message: 'You’ve been logged out successfully.',
    autoDismiss: 5
  })
  atmosphere.close()
}

export default signout
