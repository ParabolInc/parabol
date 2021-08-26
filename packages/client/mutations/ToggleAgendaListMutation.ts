import {commitMutation} from 'react-relay'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import graphql from 'babel-plugin-relay/macro'
import {ToggleAgendaListMutation as TToggleAgendaListMutation} from '../__generated__/ToggleAgendaListMutation.graphql'

const mutation = graphql`
  mutation ToggleAgendaListMutation($teamId: ID!) {
    toggleAgendaList(teamId: $teamId) {
      hideAgenda
    }
  }
`

const ToggleAgendaListMutation = (atmosphere, teamId, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation<TToggleAgendaListMutation>(atmosphere, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('toggleAgendaList')
      if (!payload) return
      const nextValue = payload.getValue('hideAgenda')
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)!
      teamMember.setValue(nextValue, 'hideAgenda')
      teamMember.setValue(true, 'hideManageTeam')
      if (!nextValue) {
        const viewer = store.getRoot().getLinkedRecord('viewer')
        const teamMember = viewer?.getLinkedRecord('teamMember', {teamId})
        if (!teamMember) return
        teamMember.setValue(null, 'manageTeamMemberId')
      }
    },
    optimisticUpdater: (store) => {
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)!
      const currentValue = teamMember.getValue('hideAgenda') || false
      teamMember.setValue(!currentValue, 'hideAgenda')
      teamMember.setValue(true, 'hideManageTeam')
    },
    onCompleted,
    onError
  })
}

export default ToggleAgendaListMutation
