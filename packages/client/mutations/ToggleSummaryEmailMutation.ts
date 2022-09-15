import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
// import {ToggleSummaryEmailMutation as TToggleSummaryEmailMutation} from '../__generated__/ToggleSummaryEmailMutation.graphql'

graphql`
  fragment ToggleSummaryEmailMutation_part on ToggleSummaryEmailSuccess {
    successField
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
      ...ToggleSummaryEmailMutation_part @relay(mask: false)
    }
  }
`

const ToggleSummaryEmailMutation: StandardMutation<any> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  // return commitMutation<TToggleSummaryEmailMutation>(atmosphere, {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {} = variables
    },
    onCompleted,
    onError
  })
}

export default ToggleSummaryEmailMutation
