import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import clientTempId from '~/utils/relay/clientTempId'
import createProxyRecord from '~/utils/relay/createProxyRecord'
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
    }
  }
`

const mutation = graphql`
  mutation UpsertTeamPromptResponseMutation(
    $teamPromptResponseId: ID
    $meetingId: ID!
    $content: String!
  ) {
    upsertTeamPromptResponse(
      teamPromptResponseId: $teamPromptResponseId
      meetingId: $meetingId
      content: $content
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
  return commitMutation<TUpsertTeamPromptResponseMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('upsertTeamPromptResponse')
      upsertTeamPromptResponseUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {teamPromptResponseId, meetingId, content} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return

      const createUpdatedResponse = () => {
        if (teamPromptResponseId) {
          const existingResponse = store.get(teamPromptResponseId)
          if (!existingResponse) return null
          existingResponse.setValue(content, 'content')
          existingResponse.setValue(plaintextContent, 'plaintextContent')
          return existingResponse
        }

        return createProxyRecord(store, 'TeamPromptResponse', {
          id: clientTempId(viewerId),
          meetingId,
          sortOrder: 0,
          content,
          plaintextContent
        })
      }

      const response = createUpdatedResponse()
      const payload = createProxyRecord(store, 'payload', {})
      payload.setLinkedRecord(response, 'teamPromptResponse')
      upsertTeamPromptResponseUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default UpsertTeamPromptResponseMutation
