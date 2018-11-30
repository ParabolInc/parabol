import {commitMutation} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast'

graphql`
  fragment AddOrgMutation_organization on AddOrgPayload {
    organization {
      id
      isBillingLeader
      name
      orgUserCount {
        activeUserCount
        inactiveUserCount
      }
      picture
      tier
    }
    team {
      id
      name
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`

graphql`
  fragment AddOrgMutation_notification on AddOrgPayload {
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
  mutation AddOrgMutation($newTeam: NewTeamInput!, $invitees: [Invitee!], $orgName: String!) {
    addOrg(newTeam: $newTeam, invitees: $invitees, orgName: $orgName) {
      error {
        message
      }
      ...AddOrgMutation_organization @relay(mask: false)
    }
  }
`

const popOrganizationCreatedToast = (payload, {atmosphere}) => {
  const teamName = payload.team.name
  if (!teamName) return
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Organization successfully created!',
    message: `Here's your new team dashboard for ${teamName}`
  })
}

export const addOrgMutationOrganizationUpdater = (payload, store, viewerId) => {
  const organization = payload.getLinkedRecord('organization')
  handleAddOrganization(organization, store, viewerId)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const addOrgMutationNotificationOnNext = (payload, {atmosphere, history}) => {
  popTeamInviteNotificationToast(payload.teamInviteNotification, {atmosphere, history})
}

export const addOrgMutationNotificationUpdater = (payload, store, viewerId) => {
  const notification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(notification, store, viewerId)
}

const AddOrgMutation = (atmosphere, variables, {history}, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg')
      if (!payload) return
      addOrgMutationOrganizationUpdater(payload, store, viewerId)
    },
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      if (!errors) {
        const payload = res.addOrg
        popOrganizationCreatedToast(payload, {history, atmosphere})
        const teamId = payload.team && payload.team.id
        history.push(`/team/${teamId}`)
      }
    },
    onError
  })
}

export default AddOrgMutation
