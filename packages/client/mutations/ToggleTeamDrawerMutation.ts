import {DrawerTypes} from 'parabol-client/types/constEnums'
import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {ToggleTeamDrawerMutation as TToggleTeamDrawerMutation} from '../__generated__/ToggleTeamDrawerMutation.graphql'

graphql`
  fragment ToggleTeamDrawerMutation_teamMember on ToggleTeamDrawerSuccess {
    hideAgenda
    hideManageTeam
  }
`

const mutation = graphql`
  mutation ToggleTeamDrawerMutation($teamId: ID!, $teamDrawerType: TeamDrawer!) {
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
    updater: (store) => {
      const {viewerId} = atmosphere
      const {teamId} = variables
      const payload = store.getRootField('toggleTeamDrawer')
      if (!payload) return
      const hideManageTeam = payload.getValue('hideManageTeam')
      const hideAgenda = payload.getValue('hideAgenda')
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      teamMember.setValue(hideManageTeam, 'hideManageTeam')
      teamMember.setValue(hideAgenda, 'hideAgenda')
      if (hideManageTeam) {
        teamMember.setValue(null, 'manageTeamMemberId')
      }
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {teamId, teamDrawerType} = variables
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const hideManageTeam = teamMember.getValue('hideManageTeam')
      const hideAgenda = teamMember.getValue('hideAgenda')
      if (teamDrawerType === DrawerTypes.AGENDA) {
        teamMember.setValue(!hideAgenda, 'hideAgenda')
        teamMember.setValue(true, 'hideManageTeam')
      } else if (teamDrawerType === DrawerTypes.MANAGE_TEAM) {
        teamMember.setValue(!hideManageTeam, 'hideManageTeam')
        teamMember.setValue(true, 'hideAgenda')
      }
    },
    onCompleted,
    onError
  })
}

export default ToggleTeamDrawerMutation
