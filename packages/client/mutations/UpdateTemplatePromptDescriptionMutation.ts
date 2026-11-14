import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UpdateTemplatePromptDescriptionMutation as TUpdateTemplatePromptDescriptionMutation} from '../__generated__/UpdateTemplatePromptDescriptionMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateTemplatePromptDescriptionMutation_team on UpdateTemplatePromptDescriptionSuccess {
    prompt {
      description
    }
  }
`

const mutation = graphql`
  mutation UpdateTemplatePromptDescriptionMutation($promptId: ID!, $description: String!) {
    updateTemplatePromptDescription(promptId: $promptId, description: $description) {
      ...UpdateTemplatePromptDescriptionMutation_team @relay(mask: false)
    }
  }
`

const UpdateTemplatePromptDescriptionMutation: StandardMutation<
  TUpdateTemplatePromptDescriptionMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TUpdateTemplatePromptDescriptionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {description, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(description, 'description')
    }
  })
}

export default UpdateTemplatePromptDescriptionMutation
