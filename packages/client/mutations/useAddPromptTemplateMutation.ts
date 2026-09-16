import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddPromptTemplateMutation as TAddPromptTemplateMutation} from '../__generated__/useAddPromptTemplateMutation.graphql'
import type {useAddPromptTemplateMutation_team$data} from '../__generated__/useAddPromptTemplateMutation_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {setActiveTemplateInRelayStore} from '../utils/relay/setActiveTemplate'
import handleAddMeetingTemplate from './handlers/handleAddMeetingTemplate'

graphql`
  fragment useAddPromptTemplateMutation_team on AddPromptTemplateSuccess {
    user {
      freeCustomRetroTemplatesRemaining
      freeCustomStandupTemplatesRemaining
    }
    template {
      ...TemplateSharing_template
      ...ActivityDetails_template
      id
      teamId
      type
    }
  }
`

const mutation = graphql`
  mutation useAddPromptTemplateMutation(
    $teamId: ID!
    $parentTemplateId: ID
    $type: PromptTemplateTypeEnum!
  ) {
    addPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId, type: $type) {
      ...useAddPromptTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addPromptTemplateTeamUpdater: SharedUpdater<useAddPromptTemplateMutation_team$data> = (
  payload,
  {store}
) => {
  const template = payload.getLinkedRecord('template')
  if (!template) return
  const templateId = template.getValue('id')
  const type = template.getValue('type')
  if (type !== 'retrospective' && type !== 'teamPrompt') return
  handleAddMeetingTemplate(template, type, store)
  const teamId = template.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  setActiveTemplateInRelayStore(store, teamId, templateId, type)
}

const useAddPromptTemplateMutation = () => {
  const [commit, submitting] = useMutation<TAddPromptTemplateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAddPromptTemplateMutation>) => {
    const {parentTemplateId, teamId, type} = config.variables
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addPromptTemplate')
        if (!payload) return
        addPromptTemplateTeamUpdater(payload, {atmosphere, store})
      },
      optimisticUpdater: (store) => {
        const nowISO = new Date().toJSON()
        const team = store.get(teamId)!
        const parentTemplate = parentTemplateId ? store.get(parentTemplateId) : null
        const name = parentTemplate ? parentTemplate.getValue('name') + ' Copy' : '*New Template ##'

        const proxyTemplate = createProxyRecord(store, 'PromptTemplate', {
          name,
          createdAt: nowISO,
          teamId,
          type
        })
        proxyTemplate.setLinkedRecord(team, 'team')
        const templateId = proxyTemplate.getValue('id')

        if (parentTemplate) {
          const currentPrompts = parentTemplate.getLinkedRecords('prompts')!
          proxyTemplate.setLinkedRecords(currentPrompts, 'prompts')
        } else {
          const prompt = createProxyRecord(store, 'TemplatePrompt', {
            description: '',
            question: 'New prompt',
            createdAt: nowISO,
            teamId,
            sortOrder: 0,
            templateId
          })
          proxyTemplate.setLinkedRecords([prompt], 'prompts')
        }
        handleAddMeetingTemplate(proxyTemplate, type, store)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddPromptTemplateMutation
