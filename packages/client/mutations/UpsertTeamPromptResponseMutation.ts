import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UpsertTeamPromptResponseMutation_meeting$data} from '~/__generated__/UpsertTeamPromptResponseMutation_meeting.graphql'
import clientTempId from '~/utils/relay/clientTempId'
import type {UpsertTeamPromptResponseMutation as TUpsertTeamPromptResponseMutation} from '../__generated__/UpsertTeamPromptResponseMutation.graphql'
import type {LocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpsertTeamPromptResponseMutation_meeting on UpsertTeamPromptResponseSuccess {
    meeting {
      id
    }
    teamPromptResponse {
      ...TeamPromptResponseCard_response @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation UpsertTeamPromptResponseMutation(
    $meetingId: ID!
    $promptId: ID!
    $content: String!
  ) @raw_response_type {
    upsertTeamPromptResponse(
      meetingId: $meetingId
      promptId: $promptId
      content: $content
    ) {
      ...UpsertTeamPromptResponseMutation_meeting @relay(mask: false) @alias
    }
  }
`

export const upsertTeamPromptResponseUpdater: SharedUpdater<
  UpsertTeamPromptResponseMutation_meeting$data
> = (payload) => {
  const newResponse = payload.getLinkedRecord('teamPromptResponse')
  const newResponseCreatorId = newResponse.getValue('userId')
  const meeting = payload.getLinkedRecord('meeting')
  if (!meeting) return
  const phases = meeting.getLinkedRecords('phases')
  if (!phases) return
  const [responsesPhase] = phases
  if (!responsesPhase) return
  const stages = responsesPhase.getLinkedRecords('stages')
  if (!stages) return
  const stageToUpdate = stages.find(
    (stage) => stage.getLinkedRecord('teamMember')?.getValue('userId') === newResponseCreatorId
  )
  if (!stageToUpdate) return
  stageToUpdate.setLinkedRecord(newResponse, 'response')
}

interface Handlers extends LocalHandlers {
  plaintextContent: string
  responseId?: string
}

const UpsertTeamPromptResponseMutation: StandardMutation<
  TUpsertTeamPromptResponseMutation,
  Handlers
> = (atmosphere, variables, {plaintextContent, responseId, onError, onCompleted}) => {
  const {viewerId} = atmosphere
  const {meetingId, content} = variables
  const now = new Date().toJSON()
  const optimisticResponse = {
    upsertTeamPromptResponse: {
      meeting: {id: meetingId},
      teamPromptResponse: {
        id: responseId ?? clientTempId(viewerId),
        userId: viewerId,
        content,
        plaintextContent,
        updatedAt: now,
        createdAt: now,
        reactjis: []
      }
    }
  }

  return commitMutation<TUpsertTeamPromptResponseMutation>(atmosphere, {
    mutation,
    variables,
    optimisticResponse,
    updater: (store) => {
      const payload = store.getRootField('upsertTeamPromptResponse')
      if (!payload) return
      upsertTeamPromptResponseUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default UpsertTeamPromptResponseMutation
