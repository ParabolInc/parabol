import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddTemplatePromptMutation as TAddTemplatePromptMutation} from '../__generated__/AddTemplatePromptMutation.graphql'
import type {AddTemplatePromptMutation_team$data} from '../__generated__/AddTemplatePromptMutation_team.graphql'
import type {BaseLocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import handleAddTemplatePrompt from './handlers/handleAddTemplatePrompt'

interface Handlers extends BaseLocalHandlers {
  promptCount: number
  sortOrder: string
}

graphql`
  fragment AddTemplatePromptMutation_team on AddTemplatePromptSuccess {
    prompt {
      ...AddTemplatePrompt_prompts @relay(mask: false)
      ...TemplatePromptList_prompts @relay(mask: false)
      id
      description
      question
      groupColor
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation AddTemplatePromptMutation($templateId: ID!) {
    addTemplatePrompt(templateId: $templateId) {
      ...AddTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const addTemplatePromptTeamUpdater: SharedUpdater<AddTemplatePromptMutation_team$data> = (
  payload,
  {store}
) => {
  const prompt = payload.getLinkedRecord('prompt')
  if (!prompt) return
  handleAddTemplatePrompt(prompt, store)
}

const AddTemplatePromptMutation: StandardMutation<TAddTemplatePromptMutation, Handlers> = (
  atmosphere,
  variables,
  {promptCount, sortOrder, onError, onCompleted}
) => {
  return commitMutation<TAddTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addTemplatePrompt')
      if (!payload) return
      addTemplatePromptTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const nowISO = new Date().toJSON()
      const proxyTemplatePrompt = createProxyRecord(store, 'TemplatePrompt', {
        description: '',
        question: `New prompt #${promptCount + 1}`,
        createdAt: nowISO,
        templateId,
        sortOrder
      })
      handleAddTemplatePrompt(proxyTemplatePrompt, store)
    }
  })
}

export default AddTemplatePromptMutation
