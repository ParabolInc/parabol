import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddReflectTemplateMutation as TAddReflectTemplateMutation} from '../__generated__/useAddReflectTemplateMutation.graphql'
import type {useAddReflectTemplateMutation_team$data} from '../__generated__/useAddReflectTemplateMutation_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {setActiveTemplateInRelayStore} from '../utils/relay/setActiveTemplate'
import handleAddMeetingTemplate from './handlers/handleAddMeetingTemplate'

graphql`
  fragment useAddReflectTemplateMutation_team on AddReflectTemplateSuccess {
    user {
      freeCustomRetroTemplatesRemaining
    }
    reflectTemplate {
      ...TemplateSharing_template
      ...ActivityDetails_template
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation useAddReflectTemplateMutation($teamId: ID!, $parentTemplateId: ID) {
    addReflectTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...useAddReflectTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addReflectTemplateTeamUpdater: SharedUpdater<
  useAddReflectTemplateMutation_team$data
> = (payload, {store}) => {
  const template = payload.getLinkedRecord('reflectTemplate')
  if (!template) return
  const templateId = template.getValue('id')
  handleAddMeetingTemplate(template, 'retrospective', store)
  const teamId = template.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  setActiveTemplateInRelayStore(store, teamId, templateId, 'retrospective')
}

const useAddReflectTemplateMutation = () => {
  const [commit, submitting] = useMutation<TAddReflectTemplateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAddReflectTemplateMutation>) => {
    const {parentTemplateId, teamId} = config.variables
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addReflectTemplate')
        if (!payload) return
        addReflectTemplateTeamUpdater(payload as any, {atmosphere, store})
      },
      optimisticUpdater: (store) => {
        const nowISO = new Date().toJSON()
        const team = store.get(teamId)!
        const parentTemplate = parentTemplateId ? store.get(parentTemplateId) : null
        const name = parentTemplate ? parentTemplate.getValue('name') + ' Copy' : '*New Template ##'

        const proxyTemplate = createProxyRecord(store, 'ReflectTemplate', {
          name,
          createdAt: nowISO,
          teamId
        })
        proxyTemplate.setLinkedRecord(team, 'team')
        const templateId = proxyTemplate.getValue('id')

        if (parentTemplate) {
          const currentPrompts = parentTemplate.getLinkedRecords('prompts')!
          proxyTemplate.setLinkedRecords(currentPrompts, 'prompts')
        } else {
          const prompt = createProxyRecord(store, 'ReflectTemplatePrompt', {
            description: '',
            question: 'New prompt',
            createdAt: nowISO,
            teamId,
            sortOrder: 0,
            templateId
          })
          proxyTemplate.setLinkedRecords([prompt], 'prompts')
        }
        handleAddMeetingTemplate(proxyTemplate, 'retrospective', store)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddReflectTemplateMutation
