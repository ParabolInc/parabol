import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemoveTeamPromptTemplateMutation as TRemoveTeamPromptTemplateMutation} from '../__generated__/RemoveTeamPromptTemplateMutation.graphql'
import type {RemoveTeamPromptTemplateMutation_team$data} from '../__generated__/RemoveTeamPromptTemplateMutation_team.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemoveTeamPromptTemplate from './handlers/handleRemoveTeamPromptTemplate'

graphql`
  fragment RemoveTeamPromptTemplateMutation_team on RemoveTeamPromptTemplateSuccess {
    teamPromptTemplate {
      id
      teamId
    }
    meetingSettings {
      selectedTemplateId
      selectedTemplate {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveTeamPromptTemplateMutation($templateId: ID!) {
    removeTeamPromptTemplate(templateId: $templateId) {
      ...RemoveTeamPromptTemplateMutation_team @relay(mask: false)
    }
  }
`

type TeamPromptTemplate = NonNullable<
  RemoveTeamPromptTemplateMutation_team$data['teamPromptTemplate']
>

export const removeTeamPromptTemplateTeamUpdater: SharedUpdater<
  RemoveTeamPromptTemplateMutation_team$data
> = (payload, {store}) => {
  const template = payload.getLinkedRecord('teamPromptTemplate')
  if (!template) return
  handleRemoveTeamPromptTemplate(template.getValue('id'), template.getValue('teamId'), store)
}

const RemoveTeamPromptTemplateMutation: StandardMutation<TRemoveTeamPromptTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemoveTeamPromptTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removeTeamPromptTemplate')
      if (!payload) return
      removeTeamPromptTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const template = store.get<TeamPromptTemplate>(templateId)
      if (!template) return
      handleRemoveTeamPromptTemplate(templateId, template.getValue('teamId'), store)
    }
  })
}

export default RemoveTeamPromptTemplateMutation
