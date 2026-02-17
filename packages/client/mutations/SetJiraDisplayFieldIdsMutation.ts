import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {SetJiraDisplayFieldIdsMutation as TSetJiraDisplayFieldIdsMutation} from '../__generated__/SetJiraDisplayFieldIdsMutation.graphql'
import type {StandardMutation} from '../types/relayMutations'

const mutation = graphql`
  mutation SetJiraDisplayFieldIdsMutation(
    $teamId: ID!
    $jiraDisplayFieldIds: [String!]!
  ) {
    setJiraDisplayFieldIds(
      teamId: $teamId
      jiraDisplayFieldIds: $jiraDisplayFieldIds
    ) {
      team {
        id
        jiraDisplayFieldIds
      }
    }
  }
`

const SetJiraDisplayFieldIdsMutation: StandardMutation<TSetJiraDisplayFieldIdsMutation> = (
  atmosphere,
  {teamId, jiraDisplayFieldIds},
  {onError, onCompleted}
) => {
  return commitMutation<TSetJiraDisplayFieldIdsMutation>(atmosphere, {
    mutation,
    variables: {
      teamId,
      jiraDisplayFieldIds
    },
    onCompleted,
    onError,
    optimisticUpdater: (store) => {
      const team = store.get(teamId)
      if (!team) return
      team.setValue(jiraDisplayFieldIds as string[], 'jiraDisplayFieldIds')
    }
  })
}

export default SetJiraDisplayFieldIdsMutation
