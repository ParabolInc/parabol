import {commitMutation} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'

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
      inviter {
        preferredName
      }
      team {
        name
      }
      id
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

const popTeamCreatedToast = (payload, {atmosphere, history}) => {
  const {id: teamId, name: teamName} = payload.team
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Team successfully created!',
    message: `Here's your new team dashboard for ${teamName}`
  })
  history.push(`/team/${teamId}`)
}

export const addTeamTeamUpdater = (payload, store, viewerId) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const addTeamMutationNotificationUpdater = (payload, store, viewerId) => {
  const notification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(notification, store, viewerId)
}

export const addTeamMutationNotificationOnNext = (payload, {atmosphere, history}) => {
  popTeamInviteNotificationToast(payload.teamInviteNotification, {atmosphere, history})
}

const AddTeamMutation = (atmosphere, variables, options, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
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
      const error = getGraphQLError(res, errors)
      if (!error) {
        const payload = res.addTeam
        popTeamCreatedToast(payload, {atmosphere, ...options})
      }
    },
    onError
  })
}

export default AddTeamMutation
