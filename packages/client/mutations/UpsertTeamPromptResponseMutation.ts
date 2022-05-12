import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import clientTempId from '~/utils/relay/clientTempId'
import {LocalHandlers, StandardMutation} from '../types/relayMutations'
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
  ) @raw_response_type {
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

interface Handlers extends LocalHandlers {
  plaintextContent: string
}

const UpsertTeamPromptResponseMutation: StandardMutation<
  TUpsertTeamPromptResponseMutation,
  Handlers
> = (atmosphere, variables, {plaintextContent, onError, onCompleted}) => {
  const {viewerId} = atmosphere
  const {meetingId, teamPromptResponseId, content} = variables
  const optimisticResponse = {
    upsertTeamPromptResponse: {
      __typename: 'UpsertTeamPromptResponseSuccess',
      meetingId,
      teamPromptResponse: {
        id: teamPromptResponseId ?? clientTempId(viewerId),
        userId: viewerId,
        content,
        plaintextContent
      }
    }
  }

  return commitMutation<TUpsertTeamPromptResponseMutation>(atmosphere, {
    mutation,
    variables,
    optimisticResponse,
    onCompleted,
    onError
  })
}

export default UpsertTeamPromptResponseMutation
