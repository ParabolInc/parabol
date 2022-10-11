import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateTeamNameMutation as TUpdateTeamNameMutation} from '../__generated__/UpdateTeamNameMutation.graphql'
graphql`
  fragment UpdateTeamNameMutation_team on UpdateTeamNamePayload {
    team {
      name
    }
  }
`

const mutation = graphql`
  mutation UpdateTeamNameMutation($updatedTeam: UpdatedTeamInput!) {
    updateTeamName(updatedTeam: $updatedTeam) {
      error {
        message
      }
      ...UpdateTeamNameMutation_team @relay(mask: false)
    }
  }
`

const UpdateTeamNameMutation: StandardMutation<TUpdateTeamNameMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTeamNameMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {updatedTeam} = variables
      const {id: teamId, name: teamName} = updatedTeam
      store.get(teamId)!.setValue(teamName, 'name')
    },
    onCompleted,
    onError
  })
}

export default UpdateTeamNameMutation
