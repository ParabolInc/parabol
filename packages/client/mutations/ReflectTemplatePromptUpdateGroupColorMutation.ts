import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {ReflectTemplatePromptUpdateGroupColorMutation as TReflectTemplatePromptUpdateGroupColorMutation} from '../__generated__/ReflectTemplatePromptUpdateGroupColorMutation.graphql'

graphql`
  fragment ReflectTemplatePromptUpdateGroupColorMutation_team on ReflectTemplatePromptUpdateGroupColorPayload {
    prompt {
      groupColor
    }
  }
`

const mutation = graphql`
  mutation ReflectTemplatePromptUpdateGroupColorMutation($promptId: ID!, $groupColor: String!) {
    reflectTemplatePromptUpdateGroupColor(promptId: $promptId, groupColor: $groupColor) {
      error {
        message
      }
      ...ReflectTemplatePromptUpdateGroupColorMutation_team @relay(mask: false)
    }
  }
`

const ReflectTemplatePromptUpdateGroupColorMutation: SimpleMutation<
  TReflectTemplatePromptUpdateGroupColorMutation
> = (atmosphere, variables) => {
  return commitMutation<TReflectTemplatePromptUpdateGroupColorMutation>(atmosphere, {
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

export default ReflectTemplatePromptUpdateGroupColorMutation
