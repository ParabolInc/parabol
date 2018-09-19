import {commitMutation} from 'react-relay'
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

graphql`
  fragment AddTeamMutation_team on AddTeamPayload {
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`

graphql`
  fragment AddTeamMutation_notification on AddTeamPayload {
    teamInviteNotification {
      type
      ...TeamInvite_notification @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation AddTeamMutation($newTeam: NewTeamInput!, $invitees: [Invitee!]) {
    addTeam(newTeam: $newTeam, invitees: $invitees) {
      error {
        message
      }
      ...AddTeamMutation_team @relay(mask: false)
    }
  }
`

const popTeamCreatedToast = (res, {dispatch, history}) => {
  const {id: teamId, name: teamName} = res.addTeam.team
  dispatch(
    showSuccess({
      title: 'Team successfully created!',
      message: `Here's your new team dashboard for ${teamName}`
    })
  )
  history.push(`/team/${teamId}`)
}

export const addTeamTeamUpdater = (payload, store, viewerId) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const addTeamMutationNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(notification, store, viewerId)
  popTeamInviteNotificationToast(notification, options)
}

const AddTeamMutation = (environment, variables, options, onError, onCompleted) => {
  const {viewerId} = environment
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addTeam')
      if (!payload) return
      addTeamTeamUpdater(payload, store, viewerId, options)
    },
    optimisticUpdater: (store) => {
      const {newTeam} = variables
      const team = createProxyRecord(store, 'Team', {
        ...newTeam,
        isPaid: true
      })
      handleAddTeams(team, store, viewerId)
    },
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      popTeamCreatedToast(res, options)
    },
    onError
  })
}

export default AddTeamMutation
