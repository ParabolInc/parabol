import graphql from 'babel-plugin-relay/macro'
import {useGenericMutation} from './useGenericMutation'

graphql`
  fragment AcceptRequestToJoinDomainMutation_success on AcceptRequestToJoinDomainSuccess
  @argumentDefinitions(requestId: {type: "ID!"}) {
    viewer {
      ...ReviewRequestToJoinOrgModal_viewer @arguments(requestId: $requestId)
    }
  }
`

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
