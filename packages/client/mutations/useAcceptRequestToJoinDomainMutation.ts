import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAcceptRequestToJoinDomainMutation as TAcceptRequestToJoinDomainMutation} from '../__generated__/useAcceptRequestToJoinDomainMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

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
      ...useAcceptRequestToJoinDomainMutation_success @arguments(requestId: $requestId) @alias
    }
  }
`
type Handlers = {
  onSuccess?: () => void
}
const useAcceptRequestToJoinDomainMutation = () => {
  const [commit, submitting] = useMutation<TAcceptRequestToJoinDomainMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TAcceptRequestToJoinDomainMutation>,
    handlers?: Handlers
  ) => {
    return commit({
      onCompleted: () => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: '🎉 Success! User added',
          autoDismiss: 5,
          key: 'acceptRequestToJoinDomainSuccess'
        })
        handlers?.onSuccess && handlers.onSuccess()
      },
      onError: snackOnError(atmosphere, 'acceptRequestToJoinDomainError'),
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAcceptRequestToJoinDomainMutation
