import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpsertTeamPromptResponseMutation as TUpsertTeamPromptResponseMutation} from '../__generated__/useUpsertTeamPromptResponseMutation.graphql'
import type {useUpsertTeamPromptResponseMutation_meeting$data} from '../__generated__/useUpsertTeamPromptResponseMutation_meeting.graphql'
import type {SharedUpdater} from '../types/relayMutations'
import handleUpsertTeamPromptResponses from './handlers/handleUpsertTeamPromptResponses'

graphql`
  fragment TeamPromptStructuredResponse_response on TeamPromptResponse {
    id
    userId
    promptId
    sharedAt
    createdAt
    updatedAt
    content
    plaintextContent
    ...TeamPromptResponseEmojis_response
  }
`

graphql`
  fragment useUpsertTeamPromptResponseMutation_meeting on UpsertTeamPromptResponseSuccess {
    meeting {
      id
      responseCount
    }
    teamPromptResponse {
      ...TeamPromptStructuredResponse_response @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useUpsertTeamPromptResponseMutation($meetingId: ID!, $promptId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
      ...useUpsertTeamPromptResponseMutation_meeting @relay(mask: false)
    }
  }
`

export const upsertTeamPromptResponseMeetingUpdater: SharedUpdater<
  useUpsertTeamPromptResponseMutation_meeting$data
> = (payload, {store}) => {
  const response = payload.getLinkedRecord('teamPromptResponse')
  const meetingId = payload.getLinkedRecord('meeting').getValue('id')
  handleUpsertTeamPromptResponses([response], meetingId, store)
}

const useUpsertTeamPromptResponseMutation = () => {
  const [commit, submitting] = useMutation<TUpsertTeamPromptResponseMutation>(mutation)
  const execute = (config: UseMutationConfig<TUpsertTeamPromptResponseMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('upsertTeamPromptResponse')
        const response = payload.getLinkedRecord('teamPromptResponse')
        handleUpsertTeamPromptResponses([response], config.variables.meetingId, store)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpsertTeamPromptResponseMutation
