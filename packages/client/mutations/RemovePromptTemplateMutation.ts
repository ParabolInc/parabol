import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemovePromptTemplateMutation as TRemovePromptTemplateMutation} from '../__generated__/RemovePromptTemplateMutation.graphql'
import type {RemovePromptTemplateMutation_team$data} from '../__generated__/RemovePromptTemplateMutation_team.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemovePromptTemplate from './handlers/handleRemovePromptTemplate'

graphql`
  fragment RemovePromptTemplateMutation_team on RemovePromptTemplateSuccess {
    template {
      id
      teamId
    }
    meetingSettings {
      ... on RetrospectiveMeetingSettings {
        selectedTemplateId
        selectedTemplate {
          id
        }
      }
      ... on TeamPromptMeetingSettings {
        selectedTemplateId
        selectedTemplate {
          id
        }
      }
    }
  }
`

const mutation = graphql`
  mutation RemovePromptTemplateMutation($templateId: ID!) {
    removePromptTemplate(templateId: $templateId) {
      ...RemovePromptTemplateMutation_team @relay(mask: false)
    }
  }
`

type PromptTemplate = RemovePromptTemplateMutation_team$data['template']

export const removePromptTemplateTeamUpdater: SharedUpdater<
  RemovePromptTemplateMutation_team$data
> = (payload, {store}) => {
  const templateId = payload.getLinkedRecord('template').getValue('id')
  const teamId = payload.getLinkedRecord('template').getValue('teamId')
  handleRemovePromptTemplate(templateId, teamId, store)
}

const RemovePromptTemplateMutation: StandardMutation<TRemovePromptTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TRemovePromptTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePromptTemplate')
      if (!payload) return
      removePromptTemplateTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const template = store.get<PromptTemplate>(templateId)!
      const teamId = template.getValue('teamId')
      handleRemovePromptTemplate(templateId, teamId, store)
    }
  })
}

export default RemovePromptTemplateMutation
