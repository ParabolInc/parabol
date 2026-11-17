import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RequestToJoinDomainMutation as TRequestToJoinDomainMutation} from '../__generated__/RequestToJoinDomainMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'
import {snackOnError} from './handlers/snackOnError'
import promptToJoinOrgSuccessToast from './toasts/promptToJoinOrgSuccessToast'

const mutation = graphql`
  mutation RequestToJoinDomainMutation {
    requestToJoinDomain {
      success
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
    onError: snackOnError(atmosphere),
    onCompleted: () => {
      atmosphere.eventEmitter.emit('addSnackbar', promptToJoinOrgSuccessToast)
    }
  })
}

export default RequestToJoinDomainMutation
