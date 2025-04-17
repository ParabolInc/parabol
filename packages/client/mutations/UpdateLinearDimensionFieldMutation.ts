import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {LinearFieldMenu_stage$data} from '../__generated__/LinearFieldMenu_stage.graphql'
import {UpdateLinearDimensionFieldMutation as TUpdateLinearDimensionFieldMutation} from '../__generated__/UpdateLinearDimensionFieldMutation.graphql'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {DiscriminateProxy} from '../types/generics'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'

graphql`
  fragment UpdateLinearDimensionFieldMutation_team on UpdateLinearDimensionFieldSuccess {
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
  mutation UpdateLinearDimensionFieldMutation(
    $dimensionName: String!
    $labelTemplate: String!
    $repoId: String!
    $meetingId: ID!
  ) {
    updateLinearDimensionField(
      dimensionName: $dimensionName
      labelTemplate: $labelTemplate
      repoId: $repoId
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateLinearDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateLinearDimensionFieldMutation: StandardMutation<TUpdateLinearDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateLinearDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {dimensionName, labelTemplate, repoId, meetingId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<LinearFieldMenu_stage$data[]>('stages')

      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getType() !== '_xLinearIssue') return
        const integration = _integration as DiscriminateProxy<typeof _integration, '_xLinearIssue'>
        const linearTeamId = integration.getLinkedRecord('team').getValue('id')
        const linearProjectId = integration.getLinkedRecord('project')?.getValue('id')
        const targetRepoId = LinearProjectId.join(linearTeamId, linearProjectId)
        if (targetRepoId !== repoId) return
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

export default UpdateLinearDimensionFieldMutation
