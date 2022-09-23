import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DiscriminateProxy} from '../types/generics'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {JiraFieldMenu_stage} from '../__generated__/JiraFieldMenu_stage.graphql'
import {PokerMeeting_meeting} from '../__generated__/PokerMeeting_meeting.graphql'
import {UpdateJiraDimensionFieldMutation as TUpdateJiraDimensionFieldMutation} from '../__generated__/UpdateJiraDimensionFieldMutation.graphql'

graphql`
  fragment UpdateJiraDimensionFieldMutation_team on UpdateDimensionFieldSuccess {
    meeting {
      phases {
        ... on EstimatePhase {
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
            projectKey
            dimensionName
            fieldName
            issueType
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateJiraDimensionFieldMutation(
    $dimensionName: String!
    $fieldName: String!
    $meetingId: ID!
    $cloudId: ID!
    $projectKey: ID!
    $issueType: ID!
  ) {
    updateJiraDimensionField(
      dimensionName: $dimensionName
      fieldName: $fieldName
      meetingId: $meetingId
      cloudId: $cloudId
      projectKey: $projectKey
      issueType: $issueType
    ) {
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
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateJiraDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, cloudId, dimensionName, fieldName, projectKey} = variables
      const meeting = store.get<PokerMeeting_meeting>(meetingId)
      if (!meeting) return
      const teamId = meeting.getValue('teamId')
      // handle team record
      const atlassianTeamIntegration = store.get(`atlassianTeamIntegration:${teamId}`)
      if (atlassianTeamIntegration) {
        const jiraDimensionFields =
          atlassianTeamIntegration.getLinkedRecords('jiraDimensionFields') || []
        const existingField = jiraDimensionFields.find(
          (dimensionField) =>
            dimensionField.getValue('dimensionName') === dimensionName &&
            dimensionField.getValue('cloudId') === cloudId &&
            dimensionField.getValue('projectKey') === projectKey
        )
        if (existingField) {
          existingField.setValue(fieldName, 'fieldName')
        } else {
          const optimisticJiraDimensionField = createProxyRecord(store, 'JiraDimensionField', {
            fieldName,
            dimensionName,
            cloudId,
            projectKey
          })
          const nextJiraDimensionFields = [...jiraDimensionFields, optimisticJiraDimensionField]
          atlassianTeamIntegration.setLinkedRecords(nextJiraDimensionFields, 'jiraDimensionFields')
        }
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<JiraFieldMenu_stage[]>('stages')
      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getValue('__typename') !== 'JiraIssue') return
        const integration = _integration as DiscriminateProxy<typeof _integration, 'JiraIssue'>
        if (integration.getValue('cloudId') !== cloudId) return
        const nextServiceField = createProxyRecord(store, 'ServiceField', {
          name: fieldName,
          // the type being a number is just a guess
          type: 'number'
        })
        stage.setLinkedRecord(nextServiceField, 'serviceField')
      })
    },
    onCompleted,
    onError
  })
}

export default UpdateJiraDimensionFieldMutation
