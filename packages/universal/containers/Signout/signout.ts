import Atmosphere from 'universal/Atmosphere'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'
import {reset as resetAppState} from 'universal/redux/rootDuck'
import {APP_TOKEN_KEY} from 'universal/utils/constants'
import {SegmentClientEventEnum} from 'universal/types/graphql'

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
