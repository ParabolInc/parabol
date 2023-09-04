import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpsertRetrospectivePromptMutation as TUpsertRetrospectivePromptMutation} from '../__generated__/UpsertReflectTemplateMutation.graphql'

graphql`
  fragment UpsertRetrospectivePromptMutation_prompt on UpsertRetrospectivePromptSuccess {
    prompt {
      id
      question
    }
  }
`

const mutation = graphql`
  mutation UpsertRetrospectivePromptMutation($meetingId: ID!, $question: String!) {
    upsertRetrospectivePrompt(meetingId: $meetingId, question: $question) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpsertRetrospectivePromptMutation_prompt @relay(mask: false)
    }
  }
`

const UpsertRetrospectivePromptMutation: StandardMutation<TUpsertRetrospectivePromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  // there is no point in optimistic updating because we don't have the votes available
  return commitMutation<TUpsertRetrospectivePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpsertRetrospectivePromptMutation
