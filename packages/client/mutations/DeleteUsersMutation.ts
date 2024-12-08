import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DeleteUsersMutation as TDeleteUsersMutation} from '../__generated__/DeleteUsersMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation DeleteUsersMutation($emails: [Email!]!) {
    deleteUsers(emails: $emails) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on DeleteUsersSuccess {
        success
      }
    }
  }
`

const DeleteUsersMutation: SimpleMutation<TDeleteUsersMutation> = (atmosphere, variables) => {
  return commitMutation<TDeleteUsersMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default DeleteUsersMutation
