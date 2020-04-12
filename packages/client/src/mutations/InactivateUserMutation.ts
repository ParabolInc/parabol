import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
const mutation = graphql`
  mutation InactivateUserMutation($userId: ID!) {
    inactivateUser(userId: $userId) {
      user {
        inactive
      }
    }
  }
`

const InactivateUserMutation = (atmosphere, userId, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables: {userId},
    optimisticUpdater: (store) => {
      const user = store.get(userId)
      if (!user) return
      user.setValue(true, 'inactive')
    },
    onCompleted,
    onError
  })
}

export default InactivateUserMutation
