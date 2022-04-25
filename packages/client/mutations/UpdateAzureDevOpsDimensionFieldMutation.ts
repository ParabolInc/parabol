import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
//import {isConstructorDeclaration} from 'typescript'
import {DiscriminateProxy} from '../types/generics'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AzureDevOpsFieldMenu_stage} from '../__generated__/AzureDevOpsFieldMenu_stage.graphql'
import {PokerMeeting_meeting} from '../__generated__/PokerMeeting_meeting.graphql'
import {UpdateAzureDevOpsDimensionFieldMutation as TUpdateAzureDevOpsDimensionFieldMutation} from '../__generated__/UpdateAzureDevOpsDimensionFieldMutation.graphql'

graphql`
  fragment UpdateAzureDevOpsDimensionFieldMutation_team on UpdateAzureDevOpsDimensionFieldSuccess {
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
        azureDevOps {
          azureDevOpsDimensionFields {
            instanceId
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
  mutation UpdateAzureDevOpsDimensionFieldMutation(
    $dimensionName: String!
    $fieldName: String!
    $meetingId: ID!
    $instanceId: ID!
    $projectKey: ID!
  ) {
    updateAzureDevOpsDimensionField(
      dimensionName: $dimensionName
      fieldName: $fieldName
      meetingId: $meetingId
      instanceId: $instanceId
      projectKey: $projectKey
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateAzureDevOpsDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateAzureDevOpsDimensionFieldMutation: StandardMutation<TUpdateAzureDevOpsDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateAzureDevOpsDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      console.log(`Inside UpdateAzureDevOpsDimensionFieldMutation with variables: ${JSON.stringify(variables)}`)
      const {meetingId, instanceId, dimensionName, fieldName, projectKey } = variables
      const meeting = store.get<PokerMeeting_meeting>(meetingId)
      if (!meeting) {
        console.log('never found meeting')
        return
      } else {
        console.log('found meeting')
      }
      console.log(`Returned meeting with value of ${meeting}`)
      const teamId = meeting.getValue('teamId')
      console.log(`The teamId is ${teamId}`)
      // handle team record
      const azureDevOpsTeamIntegration = store.get(`azureDevOpsTeamIntegration:${teamId}`)
      if (azureDevOpsTeamIntegration) {
        console.log(`retrieved azureDevOpsTeamIntegration`)
        const azureDevOpsDimensionFields =
          azureDevOpsTeamIntegration.getLinkedRecords('azureDevOpsDimensionFields') || []

        console.log(`azureDevOpsDimensionFields: ${azureDevOpsDimensionFields}`)

        const existingField = azureDevOpsDimensionFields.find(
          (dimensionField) =>
          dimensionField.getValue('dimensionName') === dimensionName &&
          dimensionField.getValue('instanceId') === instanceId &&
          dimensionField.getValue('projectKey') === projectKey
        )
        if (existingField) {
          console.log(`found existingField: ${existingField}`)
          existingField.setValue(fieldName, 'fieldName')
          console.log(`after existingField.setValue: ${existingField.setValue}`)
        } else {
          console.log(`Never found existingField`)
          const optimisticAzureDevOpsDimensionField = createProxyRecord(store, 'AzureDevOpsDimensionField', {
            fieldName,
            dimensionName,
            instanceId,
            projectKey
          })
          console.log(`optimisticAzureDevOpsDimensionField:${optimisticAzureDevOpsDimensionField}`)
          const nextAzureDevOpsDimensionFields = [...azureDevOpsDimensionFields, optimisticAzureDevOpsDimensionField]
          azureDevOpsTeamIntegration.setLinkedRecords(nextAzureDevOpsDimensionFields, 'azureDevOpsDimensionFields')
          console.log(`azureDevOpsTeamIntegration:${azureDevOpsTeamIntegration}`)
        }
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      console.log(`phases:${phases}`)
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      console.log(`estimatePhase:${estimatePhase}`)
      const stages = estimatePhase.getLinkedRecords<AzureDevOpsFieldMenu_stage[]>('stages')
      console.log(`stages:${stages}`)
      stages.forEach((stage) => {
        console.log(`stage:${stage}`)
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        console.log(`dimensionRef:${dimensionRef}`)
        const dimensionRefName = dimensionRef.getValue('name')
        console.log(`dimensionRefName:${dimensionRefName}`)
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        console.log(`task:${task}`)
        const _integration = task.getLinkedRecord('integration')
        console.log(`_integration:${_integration}`)
        if (_integration.getValue('__typename') !== 'AzureDevOpsWorkItem') return
        console.log(`__typename was AzureDevOpsWorkItem`)
        const integration = _integration as DiscriminateProxy<typeof _integration, 'AzureDevOpsWorkItem'>
        console.log(`integration:${integration}`)
        if (integration.getValue('instanceId') !== instanceId) return
        const nextServiceField = createProxyRecord(store, 'ServiceField', {
          name: fieldName,
          // the type being a number is just a guess
          type: 'number'
        })
        console.log(`nextServiceField:${nextServiceField}`)
        stage.setLinkedRecord(nextServiceField, 'serviceField')
      })
    },
    onCompleted,
    onError
  })
}

export default UpdateAzureDevOpsDimensionFieldMutation
