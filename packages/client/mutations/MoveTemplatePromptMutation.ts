import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {MoveTemplatePromptMutation as TMoveTemplatePromptMutation} from '~/__generated__/MoveTemplatePromptMutation.graphql'
import type {MoveTemplatePromptMutation_team$data} from '../__generated__/MoveTemplatePromptMutation_team.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleMoveTemplatePrompt from './handlers/handleMoveTemplatePrompt'

interface Context {
  templateId: string
}

graphql`
  fragment MoveTemplatePromptMutation_team on MoveTemplatePromptSuccess {
    prompt {
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation MoveTemplatePromptMutation($promptId: ID!, $sortOrder: String!) {
    moveTemplatePrompt(promptId: $promptId, sortOrder: $sortOrder) {
      ...MoveTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const moveTemplatePromptTeamUpdater: SharedUpdater<MoveTemplatePromptMutation_team$data> = (
  payload,
  {store}
) => {
  if (!payload) return
  const templateId = payload.getLinkedRecord('prompt').getValue('templateId')
  handleMoveTemplatePrompt(store, templateId)
}

const MoveTemplatePromptMutation: StandardMutation<TMoveTemplatePromptMutation, Context> = (
  atmosphere,
  variables,
  context
) => {
  return commitMutation<TMoveTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('moveTemplatePrompt')
      if (!payload) return
      moveTemplatePromptTeamUpdater(payload, {atmosphere, store})
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

export default MoveTemplatePromptMutation
