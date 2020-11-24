import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {IEstimateStage, IPokerMeeting, NewMeetingPhaseTypeEnum} from '../types/graphql'
import {SimpleMutation} from '../types/relayMutations'
import getJiraCloudIdAndKey from '../utils/getJiraCloudIdAndKey'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {UpdateJiraDimensionFieldMutation as TUpdateJiraDimensionFieldMutation} from '../__generated__/UpdateJiraDimensionFieldMutation.graphql'

graphql`
  fragment UpdateJiraDimensionFieldMutation_team on UpdateJiraDimensionFieldSuccess {
    meeting {
      phases {
        ...on EstimatePhase {
          stages {
            serviceField {
              name
              type
            }
          }
        }
      }
    }
    team {
      integrations {
        atlassian {
          jiraDimensionFields {
            cloudId
            dimensionId
            fieldName
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateJiraDimensionFieldMutation($dimensionId: ID!, $fieldName: String!, $meetingId: ID!, $cloudId: ID!) {
    updateJiraDimensionField(dimensionId: $dimensionId, fieldName: $fieldName, meetingId: $meetingId, cloudId: $cloudId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateJiraDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateJiraDimensionFieldMutation: SimpleMutation<TUpdateJiraDimensionFieldMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TUpdateJiraDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, cloudId, dimensionId, fieldName} = variables
      const meeting = store.get<IPokerMeeting>(meetingId)
      if (!meeting) return
      const teamId = meeting.getValue('teamId')
      // handle team record
      const atlassianTeamIntegration = store.get(`atlassianTeamIntegration:${teamId}`)
      if (atlassianTeamIntegration) {
        const jiraDimensionFields = atlassianTeamIntegration.getLinkedRecords('jiraDimensionFields') || []
        const existingField = jiraDimensionFields.find((dimensionField) => dimensionField.getValue('dimensionId') === dimensionId && dimensionField.getValue('cloudId') === cloudId)
        if (existingField) {
          existingField.setValue(fieldName, 'fieldName')
        } else {
          const optimisticJiraDimensionField = createProxyRecord(store, 'JiraDimensionField', {fieldName, dimensionId, cloudId})
          const nextJiraDimensionFields = [...jiraDimensionFields, optimisticJiraDimensionField]
          atlassianTeamIntegration.setLinkedRecords(nextJiraDimensionFields, 'jiraDimensionFields')
        }
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === NewMeetingPhaseTypeEnum.ESTIMATE)!
      const stages = estimatePhase.getLinkedRecords<IEstimateStage[]>('stages')
      stages.forEach((stage) => {
        const [stageCloudId] = getJiraCloudIdAndKey(stage.getValue('serviceTaskId'))
        if (stage.getValue('dimensionId') === dimensionId && stageCloudId === cloudId) {
          // the type being a number is just a guess
          const nextServiceField = createProxyRecord(store, 'ServiceField', {name: fieldName, type: 'number'})
          stage.setLinkedRecord(nextServiceField, 'serviceField')
        }
      })
    }
  })
}

export default UpdateJiraDimensionFieldMutation
