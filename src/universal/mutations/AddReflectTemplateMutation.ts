import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import {CompletedHandler, ErrorHandler, TeamUpdater} from '../types/relayMutations'
import handleAddReflectTemplate from './handlers/handleAddReflectTemplate'
import IAddReflectTemplateOnMutationArguments = GQL.IAddReflectTemplateOnMutationArguments

graphql`
  fragment AddReflectTemplateMutation_team on AddReflectTemplatePayload {
    reflectTemplate {
      id
      name
      teamId
      prompts {
        question
        sortOrder
      }
    }
  }
`

const mutation = graphql`
  mutation AddReflectTemplateMutation($teamId: ID!) {
    addReflectTemplate(teamId: $teamId) {
      ...AddReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addReflectTemplateTeamUpdater: TeamUpdater = (payload, {store}) => {
  const template = payload.getLinkedRecord('reflectTemplate')
  handleAddReflectTemplate(template, store)
}

const AddReflectTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IAddReflectTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addReflectTemplate')
      if (!payload) return
      addReflectTemplateTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {teamId} = variables
      const nowISO = new Date().toJSON()

      const proxyTemplate = createProxyRecord(store, 'ReflectTemplate', {
        name: '*New Template',
        createdAt: nowISO,
        teamId
      })
      const templateId = proxyTemplate.getValue('id')

      const prompt = createProxyRecord(store, 'ReflectTemplatePrompt', {
        question: 'New prompt',
        createdAt: nowISO,
        teamId,
        sortOrder: 0,
        templateId
      })
      proxyTemplate.setLinkedRecords([prompt], 'prompts')
      handleAddReflectTemplate(proxyTemplate, store)
    }
  })
}

export default AddReflectTemplateMutation
