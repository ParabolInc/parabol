import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {UpsertTeamPromptResponseMutation as TUpsertTeamPromptResponseMutation} from '../__generated__/UpsertTeamPromptResponseMutation.graphql'

graphql`
  fragment UpsertTeamPromptResponseMutation_meeting on UpsertTeamPromptResponseSuccess {
    teamPromptResponse {
      id
      content
      plaintextContent
    }
    meeting {
      ... on TeamPromptMeeting {
        id
        createdAt
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              ... on TeamPromptResponseStage {
                ...TeamPromptResponseCard_stage
              }
            }
          }
        }
      }
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

const UpsertTeamPromptResponseMutation: StandardMutation<TUpsertTeamPromptResponseMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpsertTeamPromptResponseMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {meetingId, content} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const stages = phases[0]!.getLinkedRecords('stages')
      if (!stages) return
      const stage = stages.find(
        (s) => s.getLinkedRecord('teamMember')?.getValue('userId') === viewerId
      )
      if (!stage) return
      const response = stage.getLinkedRecord('response')
      if (!response) {
        // insertion
        const newResponse = createProxyRecord(store, 'TeamPromptResponse', {
          id: clientTempId(viewerId),
          meetingId,
          sortOrder: 0,
          content
        })
        stage.setLinkedRecord(newResponse, 'response')
      } else {
        // update
        response.setValue(content, 'content')
      }
    },
    onCompleted,
    onError
  })
}

export default UpsertTeamPromptResponseMutation
