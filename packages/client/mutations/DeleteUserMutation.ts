import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {DeleteUserMutation as TDeleteUserMutation} from '../__generated__/DeleteUserMutation.graphql'

const mutation = graphql`
  mutation DeleteUserMutation($userId: ID!, $reason: String) {
    deleteUser(userId: $userId, reason: $reason) {
      error {
        message
      }
    }
  }
`

const DeleteUserMutation: SimpleMutation<TDeleteUserMutation> = (atmosphere, variables) => {
  return commitMutation<TDeleteUserMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default DeleteUserMutation
