import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RenameTemplatePromptMutation as TRenameTemplatePromptMutation} from '~/__generated__/RenameTemplatePromptMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment RenameTemplatePromptMutation_team on RenameTemplatePromptSuccess {
    prompt {
      question
    }
  }
`

const mutation = graphql`
  mutation RenameTemplatePromptMutation($promptId: ID!, $question: String!) {
    renameTemplatePrompt(promptId: $promptId, question: $question) {
      ...RenameTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

const RenameTemplatePromptMutation: StandardMutation<TRenameTemplatePromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRenameTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {question, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(question, 'question')
    }
  })
}

export default RenameTemplatePromptMutation
