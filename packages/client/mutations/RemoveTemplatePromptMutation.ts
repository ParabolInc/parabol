import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemoveTemplatePromptMutation as TRemoveTemplatePromptMutation} from '../__generated__/RemoveTemplatePromptMutation.graphql'
import type {RemoveTemplatePromptMutation_team$data} from '../__generated__/RemoveTemplatePromptMutation_team.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemoveTemplatePrompt from './handlers/handleRemoveTemplatePrompt'

graphql`
  fragment RemoveTemplatePromptMutation_team on RemoveTemplatePromptSuccess {
    prompt {
      id
      templateId
    }
  }
`

const mutation = graphql`
  mutation RemoveTemplatePromptMutation($promptId: ID!) {
    removeTemplatePrompt(promptId: $promptId) {
      ...RemoveTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const removeTemplatePromptTeamUpdater: SharedUpdater<
  RemoveTemplatePromptMutation_team$data
> = (payload, {store}) => {
  const promptId = payload.getLinkedRecord('prompt').getValue('id')
  const templateId = payload.getLinkedRecord('prompt').getValue('templateId')
  handleRemoveTemplatePrompt(promptId, templateId, store)
}

const RemoveTemplatePromptMutation: StandardMutation<TRemoveTemplatePromptMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeTemplatePrompt')
      if (!payload) return
      removeTemplatePromptTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {promptId} = variables
      const prompt = store.get(promptId)
      if (!prompt) return
      const templateId = prompt.getValue('templateId') as string
      if (!templateId) return
      handleRemoveTemplatePrompt(promptId, templateId, store)
    }
  })
}

export default RemoveTemplatePromptMutation
