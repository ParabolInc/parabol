import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {useUpsertTeamPromptAnswersMutation as TUpsertTeamPromptAnswersMutation} from '../__generated__/useUpsertTeamPromptAnswersMutation.graphql'
import type {useUpsertTeamPromptAnswersMutation_meeting$data} from '../__generated__/useUpsertTeamPromptAnswersMutation_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'

graphql`
  fragment TeamPromptStructuredResponse_response on TeamPromptResponse {
    id
    userId
    isShared
    sharedAt
    createdAt
    updatedAt
    answeredPromptIds
    content
    plaintextContent
    answers {
      id
      promptId
      content
      plaintextContent
      updatedAt
    }
    ...TeamPromptResponseEmojis_response
  }
`

graphql`
  fragment useUpsertTeamPromptAnswersMutation_meeting on UpsertTeamPromptAnswersSuccess {
    meeting {
      id
      responseCount
    }
    response {
      ...TeamPromptStructuredResponse_response @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useUpsertTeamPromptAnswersMutation(
    $meetingId: ID!
    $answers: [TeamPromptAnswerInput!]!
    $share: Boolean!
  ) {
    upsertTeamPromptAnswers(meetingId: $meetingId, answers: $answers, share: $share) {
      ...useUpsertTeamPromptAnswersMutation_meeting @relay(mask: false)
    }
  }
`

export const upsertTeamPromptAnswersMeetingUpdater: SharedUpdater<
  useUpsertTeamPromptAnswersMutation_meeting$data
> = (payload, {store}) => {
  const response = payload.getLinkedRecord('response')
  const meetingId = payload.getLinkedRecord('meeting')?.getValue('id')
  if (!response || !meetingId) return
  const userId = response.getValue('userId')
  const meeting = store.get(meetingId)
  const stages = meeting?.getLinkedRecords('phases')?.[0]?.getLinkedRecords('stages')
  const stage = stages?.find(
    (stage) => stage.getLinkedRecord('teamMember')?.getValue('userId') === userId
  )
  stage?.setLinkedRecord(response, 'response')
}

const useUpsertTeamPromptAnswersMutation = () => {
  const [commit, submitting] = useMutation<TUpsertTeamPromptAnswersMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpsertTeamPromptAnswersMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('upsertTeamPromptAnswers')
        if (!payload) return
        upsertTeamPromptAnswersMeetingUpdater(
          payload as RecordProxy<
            Omit<useUpsertTeamPromptAnswersMutation_meeting$data, ' $fragmentType'>
          >,
          {atmosphere, store}
        )
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpsertTeamPromptAnswersMutation
