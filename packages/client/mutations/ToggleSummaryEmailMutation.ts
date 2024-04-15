import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleSummaryEmailMutation as TToggleSummaryEmailMutation} from '../__generated__/ToggleSummaryEmailMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleSummaryEmailMutation_team on ToggleSummaryEmailSuccess {
    user {
      sendSummaryEmail
    }
  }
`

const mutation = graphql`
  mutation ToggleSummaryEmailMutation {
    toggleSummaryEmail {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleSummaryEmailMutation_team @relay(mask: false)
    }
  }
`

const ToggleSummaryEmailMutation: StandardMutation<TToggleSummaryEmailMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleSummaryEmailMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ToggleSummaryEmailMutation
