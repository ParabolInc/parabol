import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy} from 'relay-runtime'
import type {useAddTeamPromptTemplateMutation as TAddTeamPromptTemplateMutation} from '../__generated__/useAddTeamPromptTemplateMutation.graphql'
import type {useAddTeamPromptTemplateMutation_team$data} from '../__generated__/useAddTeamPromptTemplateMutation_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {setActiveTemplateInRelayStore} from '../utils/relay/setActiveTemplate'
import handleAddMeetingTemplate from './handlers/handleAddMeetingTemplate'

graphql`
  fragment useAddTeamPromptTemplateMutation_team on AddTeamPromptTemplateSuccess {
    user {
      freeCustomStandupTemplatesRemaining
    }
    teamPromptTemplate {
      ...TemplateSharing_template
      ...ActivityDetails_template
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation useAddTeamPromptTemplateMutation($teamId: ID!, $parentTemplateId: ID) {
    addTeamPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      ...useAddTeamPromptTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addTeamPromptTemplateTeamUpdater: SharedUpdater<
  useAddTeamPromptTemplateMutation_team$data
> = (payload, {store}) => {
  const template = payload.getLinkedRecord('teamPromptTemplate')
  if (!template) return
  const templateId = template.getValue('id')
  handleAddMeetingTemplate(template, 'teamPrompt', store)
  const teamId = template.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  setActiveTemplateInRelayStore(store, teamId, templateId, 'teamPrompt')
}

const useAddTeamPromptTemplateMutation = () => {
  const [commit, submitting] = useMutation<TAddTeamPromptTemplateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAddTeamPromptTemplateMutation>) => {
    const {parentTemplateId, teamId} = config.variables
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addTeamPromptTemplate')
        if (!payload) return
        addTeamPromptTemplateTeamUpdater(
          payload as RecordProxy<
            Omit<useAddTeamPromptTemplateMutation_team$data, ' $fragmentType'>
          >,
          {atmosphere, store}
        )
      },
      optimisticUpdater: (store) => {
        const nowISO = new Date().toJSON()
        const team = store.get(teamId)
        if (!team) return
        const parentTemplate = parentTemplateId ? store.get(parentTemplateId) : null
        const name = parentTemplate ? parentTemplate.getValue('name') + ' Copy' : '*New Template ##'
        const proxyTemplate = createProxyRecord(store, 'TeamPromptTemplate', {
          name,
          createdAt: nowISO,
          teamId,
          type: 'teamPrompt',
          category: 'standup'
        })
        proxyTemplate.setLinkedRecord(team, 'team')
        const templateId = proxyTemplate.getValue('id')
        if (parentTemplate) {
          const parentPrompts = parentTemplate.getLinkedRecords('prompts') ?? []
          proxyTemplate.setLinkedRecords(parentPrompts, 'prompts')
        } else {
          const prompt = createProxyRecord(store, 'ReflectPrompt', {
            description: '',
            question: 'New prompt',
            createdAt: nowISO,
            teamId,
            sortOrder: '"',
            templateId
          })
          proxyTemplate.setLinkedRecords([prompt], 'prompts')
        }
        handleAddMeetingTemplate(proxyTemplate, 'teamPrompt', store)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddTeamPromptTemplateMutation
