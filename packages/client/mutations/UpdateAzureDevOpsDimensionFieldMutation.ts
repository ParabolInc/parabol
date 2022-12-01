import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
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
  }
`
const mutation = graphql`
  mutation UpdateAzureDevOpsDimensionFieldMutation(
    $dimensionName: String!
    $fieldName: String!
    $meetingId: ID!
    $instanceId: ID!
    $projectKey: ID!
    $workItemType: ID!
  ) {
    updateAzureDevOpsDimensionField(
      dimensionName: $dimensionName
      fieldName: $fieldName
      meetingId: $meetingId
      instanceId: $instanceId
      projectKey: $projectKey
      workItemType: $workItemType
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

const UpdateAzureDevOpsDimensionFieldMutation: StandardMutation<
  TUpdateAzureDevOpsDimensionFieldMutation
> = (atmosphere, variables, {onCompleted, onError}) => {
  return commitMutation<TUpdateAzureDevOpsDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, instanceId, dimensionName, fieldName} = variables
      const meeting = store.get<PokerMeeting_meeting>(meetingId)
      if (!meeting) {
        return
      }
      // handle meeting records
      const phases = meeting.getLinkedRecords('phases')
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<AzureDevOpsFieldMenu_stage[]>('stages')
      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getValue('__typename') !== 'AzureDevOpsWorkItem') return
        const integration = _integration as DiscriminateProxy<
          typeof _integration,
          'AzureDevOpsWorkItem'
        >
        if (integration.getValue('instanceId') !== instanceId) return
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

export default UpdateAzureDevOpsDimensionFieldMutation
