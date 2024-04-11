import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleTeamDrawerMutation as TToggleTeamDrawerMutation} from '../__generated__/ToggleTeamDrawerMutation.graphql'
import {StandardMutation} from '../types/relayMutations'
import toTeamMemberId from '../utils/relay/toTeamMemberId'

graphql`
  fragment ToggleTeamDrawerMutation_teamMember on ToggleTeamDrawerSuccess {
    teamMember {
      openDrawer
    }
  }
`

const mutation = graphql`
  mutation ToggleTeamDrawerMutation($teamId: ID!, $teamDrawerType: TeamDrawer) {
    toggleTeamDrawer(teamId: $teamId, teamDrawerType: $teamDrawerType) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleTeamDrawerMutation_teamMember @relay(mask: false)
    }
  }
`

const ToggleTeamDrawerMutation: StandardMutation<TToggleTeamDrawerMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleTeamDrawerMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {teamId, teamDrawerType} = variables
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const openDrawer = teamMember.getValue('openDrawer')
      if (teamDrawerType === openDrawer) {
        teamMember.setValue(null, 'openDrawer')
      } else {
        teamMember.setValue(teamDrawerType, 'openDrawer')
      }
    },
    onCompleted,
    onError
  })
}

export default ToggleTeamDrawerMutation
