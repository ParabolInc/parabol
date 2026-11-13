import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useShareTopicMutation as TShareTopicMutation} from '../__generated__/useShareTopicMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment useShareTopicMutation_meeting on ShareTopicSuccess {
    meeting {
      name
      id
    }
  }
`

const mutation = graphql`
  mutation useShareTopicMutation($stageId: ID!, $meetingId: ID!, $channelId: ID!) {
    shareTopic(stageId: $stageId, meetingId: $meetingId, channelId: $channelId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...useShareTopicMutation_meeting @relay(mask: false) @alias
    }
  }
`
type Handlers = {
  onSuccess?: () => void
}
const useShareTopicMutation = () => {
  const [commit, submitting] = useMutation<TShareTopicMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TShareTopicMutation>, handlers?: Handlers) => {
    return commit({
      onCompleted: (res) => {
        const error = res.shareTopic.error
        if (!error) {
          handlers?.onSuccess?.()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'shareTopicError'
          })
        }
      },
      onError: snackOnError(atmosphere, 'shareTopicError'),
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useShareTopicMutation
