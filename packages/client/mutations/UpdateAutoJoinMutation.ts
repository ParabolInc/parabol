import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateAutoJoinMutation as TUpdateAutoJoinMutation} from '../__generated__/UpdateAutoJoinMutation.graphql'

graphql`
  fragment UpdateAutoJoinMutation_team on UpdateAutoJoinSuccess {
    updatedTeams {
      id
      autoJoin
    }
  }
`

const mutation = graphql`
  mutation UpdateAutoJoinMutation($teamIds: [ID!]!, $autoJoin: Boolean!) {
    updateAutoJoin(teamIds: $teamIds, autoJoin: $autoJoin) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateAutoJoinMutation_team @relay(mask: false)
    }
  }
`

const UpdateAutoJoinMutation: StandardMutation<TUpdateAutoJoinMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateAutoJoinMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateAutoJoinMutation
