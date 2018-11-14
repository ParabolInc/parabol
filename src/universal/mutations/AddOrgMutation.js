import {commitMutation} from 'react-relay'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'

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
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`

graphql`
  fragment AddOrgMutation_notification on AddOrgPayload {
    teamInviteNotification {
      type
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

const popOrganizationCreatedToast = (payload, {atmosphere, history}) => {
  const teamId = payload.team && payload.team.id
  if (!teamId) return
  const teamName = payload.team.name
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Organization successfully created!',
    message: `Here's your new team dashboard for ${teamName}`
  })
  history.push(`/team/${teamId}`)
}

export const addOrgMutationOrganizationUpdater = (payload, store, viewerId) => {
  const organization = payload.getLinkedRecord('organization')
  handleAddOrganization(organization, store, viewerId)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const addOrgMutationOrganizationOnNext = (payload, options) => {
  popOrganizationCreatedToast(payload, options)
}

export const addOrgMutationNotificationOnNext = (payload, options) => {
  popOrganizationCreatedToast(payload, options)
}

export const addOrgMutationNotificationUpdater = (payload, store, viewerId) => {
  const notification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(notification, store, viewerId)
}

const AddOrgMutation = (environment, variables, options, onError, onCompleted) => {
  const {viewerId} = environment
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addOrg')
      if (!payload) return
      addOrgMutationOrganizationUpdater(payload, store, viewerId)
    },
    onCompleted,
    onError
  })
}

export default AddOrgMutation
