import {ReflectTemplatePromptUpdateGroupColorMutation as TReflectTemplatePromptUpdateGroupColorMutation} from '../__generated__/ReflectTemplatePromptUpdateGroupColorMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {IReflectTemplatePromptUpdateGroupColorOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

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

const ReflectTemplatePromptUpdateGroupColorMutation = (
  atmosphere: Atmosphere,
  variables: IReflectTemplatePromptUpdateGroupColorOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TReflectTemplatePromptUpdateGroupColorMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {groupColor, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(groupColor, 'groupColor')
    }
  })
}

export default ReflectTemplatePromptUpdateGroupColorMutation
