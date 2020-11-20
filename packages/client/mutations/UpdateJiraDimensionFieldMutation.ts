import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {IPokerMeeting, NewMeetingPhaseTypeEnum} from '../types/graphql'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {UpdateJiraDimensionFieldMutation as TUpdateJiraDimensionFieldMutation} from '../__generated__/UpdateJiraDimensionFieldMutation.graphql'

graphql`
  fragment UpdateJiraDimensionFieldMutation_team on UpdateJiraDimensionFieldSuccess {
    meeting {
      phases {
        ...on EstimatePhase {
          stages {
            serviceFieldName
          }
        }
      }
    }
    team {
      integrations {
        atlassian {
          jiraDimensionFields {
            dimensionId
            fieldName
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateJiraDimensionFieldMutation($dimensionId: ID!, $fieldName: String!, $meetingId: ID!) {
    updateJiraDimensionField(dimensionId: $dimensionId, fieldName: $fieldName, meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateJiraDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateJiraDimensionFieldMutation: StandardMutation<TUpdateJiraDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateJiraDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, dimensionId, fieldName} = variables
      const meeting = store.get<IPokerMeeting>(meetingId)
      if (!meeting) return
      const teamId = meeting.getValue('teamId')
      // handle team record
      const atlassianTeamIntegration = store.get(`atlassianTeamIntegration:${teamId}`)
      if (atlassianTeamIntegration) {
        const jiraDimensionFields = atlassianTeamIntegration.getLinkedRecords('jiraDimensionFields') || []
        const existingField = jiraDimensionFields.find((dimensionField) => dimensionField.getValue('dimensionId') === dimensionId)
        if (existingField) {
          existingField.setValue(fieldName, 'fieldName')
        } else {
          const optimisticJiraDimensionField = createProxyRecord(store, 'JiraDimensionField', {fieldName, dimensionId})
          const nextJiraDimensionFields = [...jiraDimensionFields, optimisticJiraDimensionField]
          atlassianTeamIntegration.setLinkedRecords(nextJiraDimensionFields, 'jiraDimensionFields')
        }
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === NewMeetingPhaseTypeEnum.ESTIMATE)!
      const stages = estimatePhase.getLinkedRecords('stages')
      stages.forEach((stage) => {
        if (stage.getValue('dimensionId') === dimensionId) {
          stage.setValue(fieldName, 'serviceFieldName')
        }
      })
    },
    onCompleted,
    onError
  })
}

export default UpdateJiraDimensionFieldMutation
