import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UpdateTemplatePromptGroupColorMutation as TUpdateTemplatePromptGroupColorMutation} from '../__generated__/UpdateTemplatePromptGroupColorMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment UpdateTemplatePromptGroupColorMutation_team on UpdateTemplatePromptGroupColorSuccess {
    prompt {
      groupColor
    }
  }
`

const mutation = graphql`
  mutation UpdateTemplatePromptGroupColorMutation($promptId: ID!, $groupColor: String!) {
    updateTemplatePromptGroupColor(promptId: $promptId, groupColor: $groupColor) {
      ...UpdateTemplatePromptGroupColorMutation_team @relay(mask: false)
    }
  }
`

const UpdateTemplatePromptGroupColorMutation: SimpleMutation<
  TUpdateTemplatePromptGroupColorMutation
> = (atmosphere, variables) => {
  return commitMutation<TUpdateTemplatePromptGroupColorMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {groupColor, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(groupColor, 'groupColor')
    }
  })
}

export default UpdateTemplatePromptGroupColorMutation
