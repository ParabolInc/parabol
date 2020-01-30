import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {IAddReflectTemplateOnMutationArguments} from '../types/graphql'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import getCachedRecord from '../utils/relay/getCachedRecord'
import handleAddReflectTemplate from './handlers/handleAddReflectTemplate'
import {AddReflectTemplateMutation_team} from '../__generated__/AddReflectTemplateMutation_team.graphql'
import {AddReflectTemplateMutation as IAddReflectTemplateMutation} from '../__generated__/AddReflectTemplateMutation.graphql'

graphql`
  fragment AddReflectTemplateMutation_team on AddReflectTemplatePayload {
    reflectTemplate {
      id
      name
      teamId
      prompts {
        description
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

export const addReflectTemplateTeamUpdater: SharedUpdater<AddReflectTemplateMutation_team> = (
  payload,
  {store}
) => {
  const template = payload.getLinkedRecord('reflectTemplate')
  if (!template) return
  const templateId = template.getValue('id')
  handleAddReflectTemplate(template, store)
  const filterFn = (obj) => {
    return (
      obj.__typename === 'RetrospectiveMeetingSettings' &&
      obj.reflectTemplates?.__refs?.includes(templateId)
    )
  }
  const settingsRecord = getCachedRecord(store, filterFn)
  if (!settingsRecord || Array.isArray(settingsRecord)) return
  const settings = store.get(settingsRecord.__id)
  if (!settings) return
  settings.setValue(templateId, 'activeTemplateId')
}

const AddReflectTemplateMutation = (
  atmosphere: Atmosphere,
  variables: IAddReflectTemplateOnMutationArguments,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation<IAddReflectTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addReflectTemplate')
      if (!payload) return
      addReflectTemplateTeamUpdater(payload, {atmosphere, store})
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
        description: '',
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
