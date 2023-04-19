import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {RequestToJoinDomainMutation as TRequestToJoinDomainMutation} from '../__generated__/RequestToJoinDomainMutation.graphql'

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
    variables
  })
}

export default RequestToJoinDomainMutation
