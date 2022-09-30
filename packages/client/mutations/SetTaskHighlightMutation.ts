import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '../Atmosphere'
import {SimpleMutation} from '../types/relayMutations'
import {
  SetTaskHighlightMutation as TSetTaskHighlightMutation,
  SetTaskHighlightMutationVariables
} from '../__generated__/SetTaskHighlightMutation.graphql'

graphql`
  fragment SetTaskHighlightMutation_meeting on SetTaskHighlightSuccess {
    task {
      __typename
      id
      isHighlighted(meetingId: $meetingId)
    }
  }
`

const mutation = graphql`
  mutation SetTaskHighlightMutation($taskId: ID!, $meetingId: ID!, $isHighlighted: Boolean!) {
    setTaskHighlight(taskId: $taskId, meetingId: $meetingId, isHighlighted: $isHighlighted) {
      ...SetTaskHighlightMutation_meeting @relay(mask: false)
    }
  }
`

const SetTaskHighlightMutation: SimpleMutation<TSetTaskHighlightMutation> = (
  atmosphere: Atmosphere,
  variables: SetTaskHighlightMutationVariables
) =>
  commitMutation<TSetTaskHighlightMutation>(atmosphere, {
    mutation,
    variables
  })

export default SetTaskHighlightMutation
