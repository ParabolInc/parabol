import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {GenerateInsightMutation as TGenerateInsightMutation} from '../__generated__/GenerateInsightMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

graphql`
  fragment GenerateInsightMutation_team on GenerateInsightSuccess {
    team {
      id
      insight {
        wins
        challenges
        meetingsCount
      }
    }
  }
`

const mutation = graphql`
  mutation GenerateInsightMutation(
    $teamId: ID!
    $startDate: DateTime!
    $endDate: DateTime!
    $useSummaries: Boolean
    $prompt: String
  ) {
    generateInsight(
      teamId: $teamId
      startDate: $startDate
      endDate: $endDate
      useSummaries: $useSummaries
      prompt: $prompt
    ) {
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
