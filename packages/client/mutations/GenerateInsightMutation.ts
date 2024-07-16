import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {GenerateInsightMutation as TGenerateInsightMutation} from '../__generated__/GenerateInsightMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment GenerateInsightMutation_team on GenerateInsightSuccess {
    wins
    challenges
  }
`

const mutation = graphql`
  mutation GenerateInsightMutation($teamId: ID!) {
    generateInsight(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...GenerateInsightMutation_team @relay(mask: false)
    }
  }
`

const GenerateInsightMutation: StandardMutation<TGenerateInsightMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TGenerateInsightMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default GenerateInsightMutation
