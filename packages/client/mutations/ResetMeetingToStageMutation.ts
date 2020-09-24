import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {ResetMeetingToStageMutation as TResetMeetingToStageMutation} from '../__generated__/ResetMeetingToStageMutation.graphql'

const mutation = graphql`
  mutation ResetMeetingToStageMutation($meetingId: ID!, $stageId: ID!) {
    resetMeetingToStage(meetingId: $meetingId, stageId: $stageId)
  }
`

const ResetMeetingToStageMutation: SimpleMutation<TResetMeetingToStageMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables
  })
}

export default ResetMeetingToStageMutation
