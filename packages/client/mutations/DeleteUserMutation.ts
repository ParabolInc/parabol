import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {DeleteUserMutation as TDeleteUserMutation} from '../__generated__/DeleteUserMutation.graphql'
import type Atmosphere from '../Atmosphere'
import type {OptionalHandlers} from '../types/relayMutations'

const mutation = graphql`
  mutation DeleteUserMutation($userId: ID!, $reason: String) {
    deleteUser(userId: $userId, reason: $reason) {
      error {
        message
      }
    }
  }
`

const DeleteUserMutation = (
  atmosphere: Atmosphere,
  variables: TDeleteUserMutation['variables'],
  options?: OptionalHandlers
) => {
  return commitMutation<TDeleteUserMutation>(atmosphere, {
    mutation,
    variables,
    ...options
  })
}

export default DeleteUserMutation
