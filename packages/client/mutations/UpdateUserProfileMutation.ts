import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateUserProfileMutation as TUpdateUserProfileMutation} from '../__generated__/UpdateUserProfileMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateUserProfileMutation_team on UpdateUserProfilePayload {
    user {
      id
      preferredName
    }
  }
`

const mutation = graphql`
  mutation UpdateUserProfileMutation($updatedUser: UpdateUserProfileInput!) {
    updateUserProfile(updatedUser: $updatedUser) {
      error {
        message
      }
      ...UpdateUserProfileMutation_team @relay(mask: false)
    }
  }
`

const UpdateUserProfileMutation: StandardMutation<TUpdateUserProfileMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  const {viewerId} = atmosphere
  return commitMutation<TUpdateUserProfileMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId)
      if (!viewer) return
      const {updatedUser} = variables
      const {preferredName} = updatedUser
      if (viewer) {
        if (preferredName) {
          viewer.setValue(preferredName, 'preferredName')
        }
      }
    },
    onCompleted,
    onError
  })
}

export default UpdateUserProfileMutation
