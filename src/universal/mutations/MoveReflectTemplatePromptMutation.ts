import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import handleMoveTemplatePrompt from './handlers/handleMoveTemplatePrompt'
import {IMoveReflectTemplatePromptOnMutationArguments} from 'universal/types/graphql'
import getInProxy from 'universal/utils/relay/getInProxy'

interface Context {
  templateId: string
}

graphql`
  fragment MoveReflectTemplatePromptMutation_team on MoveReflectTemplatePromptPayload {
    prompt {
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation MoveReflectTemplatePromptMutation($promptId: ID!, $sortOrder: String!) {
    moveReflectTemplatePrompt(promptId: $promptId, sortOrder: $sortOrder) {
      error {
        message
      }
      ...MoveReflectTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const moveReflectTemplatePromptTeamUpdater = (payload, {store}) => {
  if (!payload) return
  const templateId = getInProxy(payload, 'prompt', 'templateId')
  handleMoveTemplatePrompt(store, templateId)
}

const MoveReflectTemplatePromptMutation = (
  atmosphere: Atmosphere,
  variables: IMoveReflectTemplatePromptOnMutationArguments,
  context: Context
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('moveReflectTemplatePrompt')
      if (!payload) return
      moveReflectTemplatePromptTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {sortOrder, promptId} = variables
      const {templateId} = context
      const prompt = store.get(promptId)
      if (!prompt) return
      prompt.setValue(sortOrder, 'sortOrder')
      handleMoveTemplatePrompt(store, templateId)
    }
  })
}

export default MoveReflectTemplatePromptMutation
