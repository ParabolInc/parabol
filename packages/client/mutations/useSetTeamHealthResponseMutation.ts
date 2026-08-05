import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useSetTeamHealthResponseMutation as TSetTeamHealthResponseMutation} from '../__generated__/useSetTeamHealthResponseMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

// selected by both the mutation payload and MeetingSubscription so the store stays in sync.
// Relay merges these fields by record id, so no manual updater is needed
graphql`
  fragment useSetTeamHealthResponseMutation_meeting on SetTeamHealthResponseSuccess {
    meeting {
      id
      respondentCount
    }
    stage {
      id
      viewerResponse {
        id
        score
        comment
      }
    }
  }
`

const mutation = graphql`
  mutation useSetTeamHealthResponseMutation(
    $meetingId: ID!
    $stageId: ID!
    $score: Int
    $comment: String
  ) {
    setTeamHealthResponse(
      meetingId: $meetingId
      stageId: $stageId
      score: $score
      comment: $comment
    ) {
      ...useSetTeamHealthResponseMutation_meeting @relay(mask: false)
    }
  }
`

const useSetTeamHealthResponseMutation = () => {
  const [commit, submitting] = useMutation<TSetTeamHealthResponseMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TSetTeamHealthResponseMutation>) => {
    return commit({
      ...config,
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 5,
          key: 'setTeamHealthResponseError'
        })
        config.onError?.(error)
      }
    })
  }
  return [execute, submitting] as const
}

export default useSetTeamHealthResponseMutation
