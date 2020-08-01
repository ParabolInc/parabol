import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {IReflectTemplate} from '../types/graphql'
import {SimpleMutation} from '../types/relayMutations'
import {RETROSPECTIVE} from '../utils/constants'
import {SelectRetroTemplateMutation as TSelectRetroTemplateMutation} from '../__generated__/SelectRetroTemplateMutation.graphql'

graphql`
  fragment SelectRetroTemplateMutation_team on SelectRetroTemplatePayload {
    retroMeetingSettings {
      selectedTemplateId
      selectedTemplate {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation SelectRetroTemplateMutation($selectedTemplateId: ID!, $teamId: ID!) {
    selectRetroTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      ...SelectRetroTemplateMutation_team @relay(mask: false)
    }
  }
`

const SelectRetroTemplateMutation: SimpleMutation<TSelectRetroTemplateMutation> = (
  atmosphere,
  variables,
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {selectedTemplateId, teamId} = variables
      const team = store.get(teamId)
      if (!team) return
      const meetingSettings = team.getLinkedRecord('meetingSettings', {meetingType: RETROSPECTIVE})
      if (!meetingSettings) return
      const selectedTemplate = store.get<IReflectTemplate>(selectedTemplateId)!
      meetingSettings.setValue(selectedTemplateId, 'selectedTemplateId')
      meetingSettings.setLinkedRecord(selectedTemplate, 'selectedTemplate')
    }
  })
}

export default SelectRetroTemplateMutation
