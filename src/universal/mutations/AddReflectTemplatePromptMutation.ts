import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import {CompletedHandler, ErrorHandler, TeamUpdater} from '../types/relayMutations'
import handleAddReflectTemplatePrompt from './handlers/handleAddReflectTemplatePrompt'
import IAddReflectTemplatePromptOnMutationArguments = GQL.IAddReflectTemplatePromptOnMutationArguments

interface Context {
  promptCount: number
  sortOrder: number
}

graphql`
  fragment AddReflectTemplatePromptMutation_team on AddReflectTemplatePromptPayload {
    prompt {
      id
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

export const addReflectTemplatePromptTeamUpdater: TeamUpdater = (payload, {store}) => {
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
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addReflectTemplatePrompt')
      if (!payload) return
      addReflectTemplatePromptTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {promptCount, sortOrder} = context
      const {templateId} = variables
      const nowISO = new Date().toJSON()
      const proxyTemplatePrompt = createProxyRecord(store, 'ReflectTemplatePrompt', {
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
