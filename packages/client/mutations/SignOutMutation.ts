import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {SignOutMutation as TSignOutMutation} from '../__generated__/SignOutMutation.graphql'
import type {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import SendClientSideEvent from '../utils/SendClientSideEvent'

const mutation = graphql`
  mutation SignOutMutation {
    signOut
  }
`

const SignOutMutation: StandardMutation<TSignOutMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {onError, onCompleted, history}
) => {
  //atmosphere.setViewer(null)
  return commitMutation<TSignOutMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, err) => {
      SendClientSideEvent(atmosphere, 'User Logout')
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'logOut',
        message: 'You’ve been logged out successfully.',
        autoDismiss: 5
      })
      setTimeout(() => {
        atmosphere.close()
        history?.replace('/')
      })
      return onCompleted?.(res, err)
    }
  })
}

export default SignOutMutation
