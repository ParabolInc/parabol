import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../hooks/useAtmosphere'
import {useAcceptRequestToJoinDomainMutation as TAcceptRequestToJoinDomainMutation} from '../__generated__/useAcceptRequestToJoinDomainMutation.graphql'
import SendClientSegmentEventMutation from './SendClientSegmentEventMutation'
import {SimpleMutationConfig, useSimpleMutation} from './useSimpleMutation'

graphql`
  fragment useAcceptRequestToJoinDomainMutation_success on AcceptRequestToJoinDomainSuccess
  @argumentDefinitions(requestId: {type: "ID!"}) {
    viewer {
      ...ReviewRequestToJoinOrgModal_viewer @arguments(requestId: $requestId)
    }
  }
`

const mutation = graphql`
  mutation useAcceptRequestToJoinDomainMutation($requestId: ID!, $teamIds: [ID!]!) {
    acceptRequestToJoinDomain(requestId: $requestId, teamIds: $teamIds) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...useAcceptRequestToJoinDomainMutation_success @arguments(requestId: $requestId)
    }
  }
`

const useAcceptRequestToJoinDomainMutation = () => {
  const [commit, submitting] = useSimpleMutation<TAcceptRequestToJoinDomainMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: SimpleMutationConfig<TAcceptRequestToJoinDomainMutation>) => {
    commit({
      variables: config.variables,
      onSuccess: (response) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: '🎉 Success! User added',
          autoDismiss: 5,
          key: 'acceptRequestToJoinDomainSuccess'
        })
        SendClientSegmentEventMutation(atmosphere, 'Join Request Reviewed', {
          action: 'accept',
          teamIds: variables.teamIds
        })

        config.onSuccess && config.onSuccess(response)
      },
      onFailure: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'acceptRequestToJoinDomainError'
        })
        config.onFailure && config.onFailure(error)
      }
    })
    const {variables} = config
  }
  return [execute, submitting] as const
}

export default useAcceptRequestToJoinDomainMutation
