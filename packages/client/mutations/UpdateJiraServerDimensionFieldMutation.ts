import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateJiraServerDimensionFieldMutation as TUpdateJiraServerDimensionFieldMutation} from '../__generated__/UpdateJiraServerDimensionFieldMutation.graphql'

graphql`
  fragment UpdateJiraServerDimensionFieldMutation_team on UpdateDimensionFieldSuccess {
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
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateJiraServerDimensionFieldMutation(
    $dimensionName: String!
    $issueType: ID!
    $fieldName: ID!
    $projectId: ID!
    $meetingId: ID!
  ) {
    updateJiraServerDimensionField(
      dimensionName: $dimensionName
      issueType: $issueType
      fieldName: $fieldName
      projectId: $projectId
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateJiraServerDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateJiraServerDimensionFieldMutation: StandardMutation<TUpdateJiraServerDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateJiraServerDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    /*optimisticUpdater: (store) => {
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
          const optimisticJiraServerDimensionField = createProxyRecord(store, 'JiraServerDimensionField', {
            fieldName,
            dimensionName,
            cloudId,
            projectKey
          })
          const nextJiraServerDimensionFields = [...jiraDimensionFields, optimisticJiraServerDimensionField]
          atlassianTeamIntegration.setLinkedRecords(nextJiraServerDimensionFields, 'jiraDimensionFields')
        }
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<JiraServerFieldMenu_stage[]>('stages')
      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getValue('__typename') !== 'JiraServerIssue') return
        const integration = _integration as DiscriminateProxy<typeof _integration, 'JiraServerIssue'>
        if (integration.getValue('cloudId') !== cloudId) return
        const nextServiceField = createProxyRecord(store, 'ServiceField', {
          name: fieldName,
          // the type being a number is just a guess
          type: 'number'
        })
        stage.setLinkedRecord(nextServiceField, 'serviceField')
      })
    },
     */
    onCompleted,
    onError
  })
}

export default UpdateJiraServerDimensionFieldMutation
