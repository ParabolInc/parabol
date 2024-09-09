import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useShareTopicMutation as TAcceptRequestToJoinDomainMutation} from '../__generated__/useShareTopicMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

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
      ...useShareTopicMutation_meeting @relay(mask: false)
    }
  }
`
type Handlers = {
  onSuccess?: () => void
  onError?: () => void
}
const useShareTopicMutation = () => {
  const [commit, submitting] = useMutation<TAcceptRequestToJoinDomainMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TAcceptRequestToJoinDomainMutation>,
    handlers?: Handlers
  ) => {
    return commit({
      onCompleted: (res) => {
        const error = res.shareTopic.error
        if (!error) {
          handlers?.onSuccess && handlers.onSuccess()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'shareTopicError'
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

export default useShareTopicMutation
