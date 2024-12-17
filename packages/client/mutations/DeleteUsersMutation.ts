import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DeleteUsersMutation as TDeleteUsersMutation} from '../__generated__/DeleteUsersMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment DeleteUsersMutation_users on DeleteUsersSuccess {
    deletedUsers {
      id
      email
      isRemoved
    }
  }
`

const mutation = graphql`
  mutation DeleteUsersMutation($emails: [Email!]!) {
    deleteUsers(emails: $emails) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...DeleteUsersMutation_users @relay(mask: false)
    }
  }
`

const DeleteUsersMutation: StandardMutation<TDeleteUsersMutation> = (atmosphere, variables) => {
  return commitMutation<TDeleteUsersMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default DeleteUsersMutation
