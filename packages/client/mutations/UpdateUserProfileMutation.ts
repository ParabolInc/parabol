import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateUserProfileMutation as TUpdateUserProfileMutation} from '../__generated__/UpdateUserProfileMutation.graphql'
graphql`
  fragment UpdateUserProfileMutation_team on UpdateUserProfilePayload {
    teamMembers {
      preferredName
      picture
      user {
        picture
        preferredName
      }
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
      const {picture, preferredName} = updatedUser
      if (viewer) {
        if (preferredName) {
          viewer.setValue(preferredName, 'preferredName')
        }
        if (picture) {
          viewer.setValue(picture, 'picture')
        }
      }
    },
    onCompleted,
    onError
  })
}

export default UpdateUserProfileMutation
