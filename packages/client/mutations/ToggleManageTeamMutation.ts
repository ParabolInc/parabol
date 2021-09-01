import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import {ToggleManageTeamMutation as TToggleManageTeamMutation} from '../__generated__/ToggleManageTeamMutation.graphql'

graphql`
  fragment ToggleManageTeamMutation_teamMember on ToggleManageTeamSuccess {
    hideManageTeam
  }
`

const mutation = graphql`
  mutation ToggleManageTeamMutation($teamId: ID!) {
    toggleManageTeam(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleManageTeamMutation_teamMember @relay(mask: false)
    }
  }
`

const ToggleManageTeamMutation: StandardMutation<TToggleManageTeamMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleManageTeamMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {viewerId} = atmosphere
      const {teamId} = variables
      const payload = store.getRootField('toggleManageTeam')
      if (!payload) return
      const nextValue = payload.getValue('hideManageTeam')
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      teamMember.setValue(nextValue, 'hideManageTeam')
      teamMember.setValue(true, 'hideAgenda')
      if (nextValue) {
        teamMember.setValue(null, 'manageTeamMemberId')
      }
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {teamId} = variables
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const currentValue = teamMember.getValue('hideManageTeam') || false
      teamMember.setValue(!currentValue, 'hideManageTeam')
      teamMember.setValue(true, 'hideAgenda')
    },
    onCompleted,
    onError
  })
}

export default ToggleManageTeamMutation
