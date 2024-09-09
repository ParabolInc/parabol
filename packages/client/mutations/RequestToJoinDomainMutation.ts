import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RequestToJoinDomainMutation as TRequestToJoinDomainMutation} from '../__generated__/RequestToJoinDomainMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'
import promptToJoinOrgSuccessToast from './toasts/promptToJoinOrgSuccessToast'

const mutation = graphql`
  mutation RequestToJoinDomainMutation {
    requestToJoinDomain {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on RequestToJoinDomainSuccess {
        success
      }
    }
  }
`

const RequestToJoinDomainMutation: SimpleMutation<TRequestToJoinDomainMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TRequestToJoinDomainMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res) => {
      const error = res.requestToJoinDomain.error
      if (!error) {
        atmosphere.eventEmitter.emit('addSnackbar', promptToJoinOrgSuccessToast)
      } else {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'promptToJoinOrgError'
        })
      }
    }
  })
}

export default RequestToJoinDomainMutation
