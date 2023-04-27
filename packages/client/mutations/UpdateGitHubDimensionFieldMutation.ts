import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DiscriminateProxy} from '../types/generics'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {GitHubFieldMenu_stage$data} from '../__generated__/GitHubFieldMenu_stage.graphql'
import {UpdateGitHubDimensionFieldMutation as TUpdateGitHubDimensionFieldMutation} from '../__generated__/UpdateGitHubDimensionFieldMutation.graphql'

graphql`
  fragment UpdateGitHubDimensionFieldMutation_team on UpdateGitHubDimensionFieldSuccess {
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
  mutation UpdateGitHubDimensionFieldMutation(
    $dimensionName: String!
    $labelTemplate: String!
    $nameWithOwner: ID!
    $meetingId: ID!
  ) {
    updateGitHubDimensionField(
      dimensionName: $dimensionName
      labelTemplate: $labelTemplate
      nameWithOwner: $nameWithOwner
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateGitHubDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateGitHubDimensionFieldMutation: StandardMutation<TUpdateGitHubDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateGitHubDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {dimensionName, labelTemplate, nameWithOwner, meetingId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<GitHubFieldMenu_stage$data[]>('stages')
      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getType() !== '_xGitHubIssue') return
        const integration = _integration as DiscriminateProxy<typeof _integration, '_xGitHubIssue'>
        const repository = integration.getLinkedRecord('repository')
        if (repository.getValue('nameWithOwner') !== nameWithOwner) return
        const nextServiceField = createProxyRecord(store, 'ServiceField', {
          name: labelTemplate,
          type: 'string'
        })
        stage.setLinkedRecord(nextServiceField, 'serviceField')
      })
    },
    onCompleted,
    onError
  })
}

export default UpdateGitHubDimensionFieldMutation
