import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {BaseLocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddReflectTemplatePromptMutation as TAddReflectTemplatePromptMutation} from '../__generated__/AddReflectTemplatePromptMutation.graphql'
import {AddReflectTemplatePromptMutation_team$data} from '../__generated__/AddReflectTemplatePromptMutation_team.graphql'
import handleAddReflectTemplatePrompt from './handlers/handleAddReflectTemplatePrompt'

interface Handlers extends BaseLocalHandlers {
  promptCount: number
  sortOrder: number
}

graphql`
  fragment AddReflectTemplatePromptMutation_team on AddReflectTemplatePromptPayload {
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
  mutation AddReflectTemplatePromptMutation($templateId: ID!) {
    addReflectTemplatePrompt(templateId: $templateId) {
      ...AddReflectTemplatePromptMutation_team @relay(mask: false)
    }
  }
`

export const addReflectTemplatePromptTeamUpdater: SharedUpdater<
  AddReflectTemplatePromptMutation_team$data
> = (payload, {store}) => {
  const prompt = payload.getLinkedRecord('prompt')
  if (!prompt) return
  handleAddReflectTemplatePrompt(prompt, store)
}

const AddReflectTemplatePromptMutation: StandardMutation<
  TAddReflectTemplatePromptMutation,
  Handlers
> = (atmosphere, variables, {promptCount, sortOrder, onError, onCompleted}) => {
  return commitMutation<TAddReflectTemplatePromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addReflectTemplatePrompt')
      if (!payload) return
      addReflectTemplatePromptTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const nowISO = new Date().toJSON()
      const proxyTemplatePrompt = createProxyRecord(store, 'ReflectTemplatePrompt', {
        description: '',
        question: `New prompt #${promptCount + 1}`,
        createdAt: nowISO,
        templateId,
        sortOrder
      })
      handleAddReflectTemplatePrompt(proxyTemplatePrompt, store)
    }
  })
}

export default AddReflectTemplatePromptMutation
