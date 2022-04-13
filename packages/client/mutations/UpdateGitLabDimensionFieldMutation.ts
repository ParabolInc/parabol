import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {DiscriminateProxy} from '../types/generics'
import {StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {GitLabFieldMenu_stage} from '../__generated__/GitLabFieldMenu_stage.graphql'
import {UpdateGitLabDimensionFieldMutation as TUpdateGitLabDimensionFieldMutation} from '../__generated__/UpdateGitLabDimensionFieldMutation.graphql'

graphql`
  fragment UpdateGitLabDimensionFieldMutation_team on UpdateGitLabDimensionFieldSuccess {
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
  mutation UpdateGitLabDimensionFieldMutation(
    $dimensionName: String!
    $labelTemplate: String!
    $gid: ID!
    $meetingId: ID!
  ) {
    updateGitLabDimensionField(
      dimensionName: $dimensionName
      labelTemplate: $labelTemplate
      gid: $gid
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateGitLabDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateGitLabDimensionFieldMutation: StandardMutation<TUpdateGitLabDimensionFieldMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TUpdateGitLabDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {dimensionName, labelTemplate, gid, meetingId} = variables
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const estimatePhase = phases.find((phase) => phase.getValue('phaseType') === 'ESTIMATE')!
      const stages = estimatePhase.getLinkedRecords<GitLabFieldMenu_stage[]>('stages')

      stages.forEach((stage) => {
        const dimensionRef = stage.getLinkedRecord('dimensionRef')
        const dimensionRefName = dimensionRef.getValue('name')
        if (dimensionRefName !== dimensionName) return
        const task = stage.getLinkedRecord('task')
        const _integration = task.getLinkedRecord('integration')
        if (_integration.getType() !== '_xGitLabIssue') return
        const integration = _integration as DiscriminateProxy<typeof _integration, '_xGitLabIssue'>
        if (integration.getValue('id') !== gid) return
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

export default UpdateGitLabDimensionFieldMutation
