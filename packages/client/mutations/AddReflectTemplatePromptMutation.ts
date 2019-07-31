import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleAddReflectTemplatePrompt from './handlers/handleAddReflectTemplatePrompt'
import {IAddReflectTemplatePromptOnMutationArguments} from '../types/graphql'
import {AddReflectTemplatePromptMutation_team} from '../__generated__/AddReflectTemplatePromptMutation_team.graphql'

interface Context {
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
  AddReflectTemplatePromptMutation_team
> = (payload, {store}) => {
  const prompt = payload.getLinkedRecord('prompt')
  if (!prompt) return
  handleAddReflectTemplatePrompt(prompt, store)
}

const AddReflectTemplatePromptMutation = (
  atmosphere: Atmosphere,
  variables: IAddReflectTemplatePromptOnMutationArguments,
  context: Context,
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation(atmosphere, {
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
      const {promptCount, sortOrder} = context
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
