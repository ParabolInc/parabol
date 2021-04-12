import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddMissingJiraFieldMutation as TAddMissingJiraFieldMutation} from '../__generated__/AddMissingJiraFieldMutation.graphql'

graphql`
  fragment AddMissingJiraFieldMutation_part on AddMissingJiraFieldSuccess {
    dimensionField {
      fieldId
    }
  }
`

const mutation = graphql`
  mutation AddMissingJiraFieldMutation($meetingId: ID!, $stageId: ID!) {
    addMissingJiraField(meetingId: $meetingId, stageId: $stageId) {
      ...AddMissingJiraFieldMutation_part @relay(mask: false)
    }
  }
`

const AddMissingJiraFieldMutation: StandardMutation<TAddMissingJiraFieldMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddMissingJiraFieldMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddMissingJiraFieldMutation
