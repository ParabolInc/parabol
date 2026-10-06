import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useShareTeamPromptResponsesMutation as TUseShareTeamPromptResponsesMutation} from '../__generated__/useShareTeamPromptResponsesMutation.graphql'
import type {useShareTeamPromptResponsesMutation_meeting$data} from '../__generated__/useShareTeamPromptResponsesMutation_meeting.graphql'
import type {SharedUpdater} from '../types/relayMutations'
import handleUpsertTeamPromptResponses from './handlers/handleUpsertTeamPromptResponses'

graphql`
  fragment useShareTeamPromptResponsesMutation_meeting on ShareTeamPromptResponsesSuccess {
    meeting {
      id
      responseCount
    }
    responses {
      ...TeamPromptStructuredResponse_response @relay(mask: false)
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

export const shareTeamPromptResponsesMeetingUpdater: SharedUpdater<
  useShareTeamPromptResponsesMutation_meeting$data
> = (payload, {store}) => {
  const responses = payload.getLinkedRecords('responses')
  const meetingId = payload.getLinkedRecord('meeting').getValue('id')
  handleUpsertTeamPromptResponses(responses, meetingId, store)
}

const useShareTeamPromptResponsesMutation = () => {
  const [commit, submitting] = useMutation<TUseShareTeamPromptResponsesMutation>(mutation)
  const execute = (config: UseMutationConfig<TUseShareTeamPromptResponsesMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useShareTeamPromptResponsesMutation
