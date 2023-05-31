import graphql from 'babel-plugin-relay/macro'
import {useGenericMutation} from './useGenericMutation'
const mutation = graphql`
  mutation AcceptRequestToJoinDomainMutation($requestId: ID!, $teamIds: [ID!]!) {
    acceptRequestToJoinDomain(requestId: $requestId, teamIds: $teamIds) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AcceptRequestToJoinDomainMutation_success @arguments(requestId: $requestId)
    }
  }
`

const useAcceptRequestToJoinDomainMutation = () => {
  return useGenericMutation(
    mutation,
    'acceptRequestToJoinDomain',
    '🎉 Success! User added',
    'Error while adding the user'
  )
}

export default useAcceptRequestToJoinDomainMutation
