import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useShareTeamPromptResponsesMutation as TUseShareTeamPromptResponsesMutation} from '../__generated__/useShareTeamPromptResponsesMutation.graphql'

graphql`
  fragment useShareTeamPromptResponsesMutation_meeting on ShareTeamPromptResponsesSuccess {
    meeting {
      id
    }
    responses {
      ...TeamPromptResponseCard_response @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useShareTeamPromptResponsesMutation($meetingId: ID!) {
    shareTeamPromptResponses(meetingId: $meetingId) {
      ...useShareTeamPromptResponsesMutation_meeting @relay(mask: false)
    }
  }
`

const useShareTeamPromptResponsesMutation = () => {
  const [commit, submitting] = useMutation<TUseShareTeamPromptResponsesMutation>(mutation)
  const execute = (config: UseMutationConfig<TUseShareTeamPromptResponsesMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useShareTeamPromptResponsesMutation
