import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import { SimpleMutation } from "../types/relayMutations";
import {RequestToJoinDomainMutation as TRequestToJoinDomainMutation} from '../__generated__/RequestToJoinDomainMutation.graphql'

graphql`
  fragment RequestToJoinDomainMutation_part on RequestToJoinDomainSuccess {
    success
  }
`

const mutation = graphql`
  mutation RequestToJoinDomainMutation {
    requestToJoinDomain {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RequestToJoinDomainMutation_part @relay(mask: false)
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
  })
}

export default RequestToJoinDomainMutation
