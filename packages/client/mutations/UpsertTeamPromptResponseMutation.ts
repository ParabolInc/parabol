import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import clientTempId from '~/utils/relay/clientTempId'
import {UpsertTeamPromptResponseMutation_meeting} from '~/__generated__/UpsertTeamPromptResponseMutation_meeting.graphql'
import {LocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import {UpsertTeamPromptResponseMutation as TUpsertTeamPromptResponseMutation} from '../__generated__/UpsertTeamPromptResponseMutation.graphql'

graphql`
  fragment UpsertTeamPromptResponseMutation_meeting on UpsertTeamPromptResponseSuccess {
    meetingId
    teamPromptResponse {
      id
      userId
      content
      plaintextContent
      isDraft
      updatedAt
      createdAt
    }
  }
`

const mutation = graphql`
  mutation UpsertTeamPromptResponseMutation(
    $teamPromptResponseId: ID
    $meetingId: ID!
    $content: String!
    $isDraft: Boolean!
  ) @raw_response_type {
    upsertTeamPromptResponse(
      teamPromptResponseId: $teamPromptResponseId
      meetingId: $meetingId
      content: $content
      isDraft: $isDraft
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpsertTeamPromptResponseMutation_meeting @relay(mask: false)
    }
  }
`

export const upsertTeamPromptResponseUpdater: SharedUpdater<
  UpsertTeamPromptResponseMutation_meeting
> = (payload, {store}) => {
  const newResponse = payload.getLinkedRecord('teamPromptResponse')
  const newResponseCreatorId = newResponse.getValue('userId')
  const meetingId = payload.getValue('meetingId')
  const meeting = store.get(meetingId)
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
}

const UpsertTeamPromptResponseMutation: StandardMutation<
  TUpsertTeamPromptResponseMutation,
  Handlers
> = (atmosphere, variables, {plaintextContent, onError, onCompleted}) => {
  const {viewerId} = atmosphere
  const {meetingId, teamPromptResponseId, content} = variables
  const now = new Date().toJSON()
  const optimisticResponse = {
    upsertTeamPromptResponse: {
      __typename: 'UpsertTeamPromptResponseSuccess',
      meetingId,
      teamPromptResponse: {
        id: teamPromptResponseId ?? clientTempId(viewerId),
        userId: viewerId,
        content,
        plaintextContent,
        updatedAt: now,
        createdAt: !teamPromptResponseId ? now : undefined
      }
    }
  }

  return commitMutation<TUpsertTeamPromptResponseMutation>(atmosphere, {
    mutation,
    variables,
    optimisticResponse,
    updater: (store) => {
      const payload = store.getRootField('upsertTeamPromptResponse')
      upsertTeamPromptResponseUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default UpsertTeamPromptResponseMutation
