import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {GenerateMeetingSummaryMutation as TGenerateMeetingSummaryMutation} from '../__generated__/GenerateMeetingSummaryMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment GenerateMeetingSummaryMutation_meeting on GenerateMeetingSummarySuccess {
    meetings {
      summary
    }
  }
`

const mutation = graphql`
  mutation GenerateMeetingSummaryMutation($teamIds: [ID!]!) {
    generateMeetingSummary(teamIds: $teamIds) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...GenerateMeetingSummaryMutation_meeting @relay(mask: false)
    }
  }
`

const GenerateMeetingSummaryMutation: StandardMutation<TGenerateMeetingSummaryMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TGenerateMeetingSummaryMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default GenerateMeetingSummaryMutation
