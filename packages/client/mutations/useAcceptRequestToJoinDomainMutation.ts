import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useAcceptRequestToJoinDomainMutation as TAcceptRequestToJoinDomainMutation} from '../__generated__/useAcceptRequestToJoinDomainMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSideEvent from '../utils/SendClientSideEvent'

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
type Handlers = {
  onSuccess?: () => void
  onError?: () => void
}
const useAcceptRequestToJoinDomainMutation = () => {
  const [commit, submitting] = useMutation<TAcceptRequestToJoinDomainMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TAcceptRequestToJoinDomainMutation>,
    handlers?: Handlers
  ) => {
    const {variables} = config
    return commit({
      onCompleted: (res) => {
        const error = res.acceptRequestToJoinDomain.error

        if (!error) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: '🎉 Success! User added',
            autoDismiss: 5,
            key: 'acceptRequestToJoinDomainSuccess'
          })
          SendClientSideEvent(atmosphere, 'Join Request Reviewed', {
            action: 'accept',
            teamIds: variables.teamIds
          })
          handlers?.onSuccess && handlers.onSuccess()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'acceptRequestToJoinDomainError'
          })
          handlers?.onError && handlers.onError()
        }
      },
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAcceptRequestToJoinDomainMutation
