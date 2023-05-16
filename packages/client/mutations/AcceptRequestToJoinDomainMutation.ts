import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {AcceptRequestToJoinDomainMutation as TAcceptRequestToJoinDomainMutation} from '../__generated__/AcceptRequestToJoinDomainMutation.graphql'
import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'

graphql`
  fragment AcceptRequestToJoinDomainMutation_success on AcceptRequestToJoinDomainSuccess
  @argumentDefinitions(requestId: {type: "Int!"}) {
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

const AcceptRequestToJoinDomainMutation: SimpleMutation<TAcceptRequestToJoinDomainMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TAcceptRequestToJoinDomainMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res) => {
      const error = res.acceptRequestToJoinDomain.error
      if (!error) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: '🎉 Success! User added',
          autoDismiss: 5,
          key: 'acceptRequestToJoinDomainSuccess'
        })
        SendClientSegmentEventMutation(atmosphere, 'Join Request Reviewed', {
          action: 'accept',
          teamIds: variables.teamIds
        })
      } else {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'acceptRequestToJoinDomainError'
        })
      }
    }
  })
}

export default AcceptRequestToJoinDomainMutation
