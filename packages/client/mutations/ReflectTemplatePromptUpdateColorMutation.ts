import {ReflectTemplatePromptUpdateColorMutation as TReflectTemplatePromptUpdateColorMutation} from '../__generated__/ReflectTemplatePromptUpdateColorMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {IReflectTemplatePromptUpdateColorOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment ReflectTemplatePromptUpdateColorMutation_team on ReflectTemplatePromptUpdateDescriptionPayload {
    prompt {
      color
    }
  }
`

const mutation = graphql`
  mutation ReflectTemplatePromptUpdateColorMutation($promptId: ID!, $color: String!) {
    reflectTemplatePromptUpdateColor(promptId: $promptId, color: $color) {
      error {
        message
      }
      ...ReflectTemplatePromptUpdateColorMutation_team @relay(mask: false)
    }
  }
`

const ReflectTemplatePromptUpdateColorMutation = (
  atmosphere: Atmosphere,
  variables: IReflectTemplatePromptUpdateColorOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TReflectTemplatePromptUpdateColorMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const {color, promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(color, 'color')
    }
  })
}

export default ReflectTemplatePromptUpdateColorMutation
