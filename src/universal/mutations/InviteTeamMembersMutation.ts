import {InviteTeamMembersMutation_invitation} from '__generated__/InviteTeamMembersMutation_invitation.graphql'
import {InviteTeamMembersMutation_notification} from '__generated__/InviteTeamMembersMutation_notification.graphql'
import {InviteTeamMembersMutation_orgApproval} from '__generated__/InviteTeamMembersMutation_orgApproval.graphql'
import {InviteTeamMembersMutation_teamMember} from '__generated__/InviteTeamMembersMutation_teamMember.graphql'
import {commitMutation, graphql} from 'react-relay'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddOrgApprovals from 'universal/mutations/handlers/handleAddOrgApprovals'
import handleAddSoftTeamMembers from 'universal/mutations/handlers/handleAddSoftTeamMembers'
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getInProxy from 'universal/utils/relay/getInProxy'
import {InviteTeamMembersMutationResponse} from '__generated__/InviteTeamMembersMutation.graphql'
import popTeamInviteNotificationToast from './toasts/popTeamInviteNotificationToast'

graphql`
  fragment InviteTeamMembersMutation_invitation on InviteTeamMembersPayload {
    invitationsSent {
      ...CompleteInvitationFrag @relay(mask: false)
    }
  }
`

graphql`
  fragment InviteTeamMembersMutation_notification on InviteTeamMembersPayload {
    reactivationNotification {
      type
      team {
        name
      }
      id
      ...AddedToTeam_notification @relay(mask: false)
    }
    teamInviteNotification {
      type
      team {
        name
      }
      inviter {
        preferredName
      }
      id
      ...TeamInvite_notification @relay(mask: false)
    }
    removedRequestNotification {
      id
    }
    requestNotification {
      type
      inviter {
        preferredName
      }
      ...RequestNewUser_notification @relay(mask: false)
    }
    team {
      ...CompleteTeamFragWithMembers @relay(mask: false)
    }
  }
`

graphql`
  fragment InviteTeamMembersMutation_orgApproval on InviteTeamMembersPayload {
    orgApprovalsSent {
      ...CompleteOrgApprovalFrag @relay(mask: false)
      notification {
        id
        inviter {
          preferredName
        }
      }
    }
    orgApprovalsRemoved {
      id
      teamId
    }
  }
`

graphql`
  fragment InviteTeamMembersMutation_teamMember on InviteTeamMembersPayload {
    reactivatedTeamMembers {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
    team {
      name
    }
    newSoftTeamMembers {
      id
      email
      preferredName
      teamId
    }
  }
`

graphql`
  fragment InviteTeamMembersMutation_task on InviteTeamMembersPayload {
    unarchivedSoftTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation InviteTeamMembersMutation($teamId: ID!, $invitees: [Invitee!]!) {
    inviteTeamMembers(invitees: $invitees, teamId: $teamId) {
      error {
        message
      }
      ...InviteTeamMembersMutation_invitation @relay(mask: false)
      ...InviteTeamMembersMutation_notification @relay(mask: false)
      ...InviteTeamMembersMutation_orgApproval @relay(mask: false)
      ...InviteTeamMembersMutation_teamMember @relay(mask: false)
      ...InviteTeamMembersMutation_task @relay(mask: false)
    }
  }
`

export const inviteTeamMembersTaskUpdater = (payload, store, viewerId) => {
  const unarchivedSoftTasks = payload.getLinkedRecords('unarchivedSoftTasks')
  handleUpsertTasks(unarchivedSoftTasks, store, viewerId)
}

const popInvitationToast = (
  invitationsSent: InviteTeamMembersMutation_invitation['invitationsSent'],
  {atmosphere}
) => {
  if (!invitationsSent || invitationsSent.length === 0) return
  const emails = invitationsSent.map((invite) => invite.email)
  if (!emails) return
  const emailStr = emails.join(', ')
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Invitation sent!',
    message: `An invitation has been sent to ${emailStr}`
  })
}

const popReactivationToast = (
  reactivatedTeamMembers: InviteTeamMembersMutation_teamMember['reactivatedTeamMembers'],
  {atmosphere}
) => {
  if (!reactivatedTeamMembers || reactivatedTeamMembers.length === 0) return
  const names = reactivatedTeamMembers.map((teamMember) => teamMember.preferredName)
  const isSingular = names.length === 1
  const nameStr = names.join(', ')
  const message = isSingular
    ? `${nameStr} used to be on this team, so they were automatically approved`
    : `The following team members have been reinstated: ${nameStr}`
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Back in it!',
    message
  })
}

const popReactivatedNotificationToast = (
  reactivationNotification: InviteTeamMembersMutation_notification['reactivationNotification'],
  {atmosphere}
) => {
  const teamName =
    reactivationNotification && reactivationNotification.team && reactivationNotification.team.name
  if (!teamName) return
  const notificationId = reactivationNotification && reactivationNotification.id
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been added to team ${teamName}`,
    action: {
      label: 'Great!',
      callback: () => {
        ClearNotificationMutation(atmosphere, notificationId)
      }
    }
  })
}

const popOrgApprovalToast = (
  orgApprovalsSent: InviteTeamMembersMutation_orgApproval['orgApprovalsSent'],
  {atmosphere}
) => {
  if (!orgApprovalsSent || orgApprovalsSent.length === 0) return
  const emails = orgApprovalsSent.map((approval) => approval.email)
  if (!emails) return
  const [firstEmail] = emails
  const emailStr = emails.join(', ')
  atmosphere.eventEmitter.emit('addToast', {
    level: 'success',
    title: 'Request sent to admin',
    message:
      emails.length === 1
        ? `A request to add ${firstEmail} has been sent to your organization admin`
        : `The following invitations are awaiting approval from your organization admin: ${emailStr}`
  })
}

const popTeamMemberReactivatedToast = (
  payload: InviteTeamMembersMutation_teamMember,
  {atmosphere}
) => {
  // pop 1 toast per reactivation. simple for now
  const {reactivatedTeamMembers, team} = payload
  const teamName = team && team.name
  if (!teamName || !reactivatedTeamMembers) return
  const names = reactivatedTeamMembers.map((member) => member.preferredName)
  names.forEach((name) => {
    atmosphere.eventEmitter.emit('addToast', {
      level: 'info',
      autoDismiss: 10,
      title: 'They’re back!',
      message: `${name} has rejoined ${teamName}`
    })
  })
}

const popRequestNewUserNotificationToast = (
  requestNotification: InviteTeamMembersMutation_notification['requestNotification'],
  {atmosphere, history}
) => {
  const inviterName =
    requestNotification && requestNotification.inviter && requestNotification.inviter.preferredName
  if (!inviterName) return
  atmosphere.eventEmitter.emit('addToast', {
    autoDismiss: 10,
    title: 'Approval Requested!',
    message: `${inviterName} would like to invite someone to their team`,
    action: {
      label: 'Check it out',
      callback: () => {
        history.push('/me/notifications')
      }
    }
  })
}

export const inviteTeamMembersInvitationUpdater = (payload, store) => {
  const invitationsSent = payload.getLinkedRecords('invitationsSent')
  handleAddInvitations(invitationsSent, store)
}

export const inviteTeamMembersNotificationUpdater = (payload, store, viewerId) => {
  const reactivationNotification = payload.getLinkedRecord('reactivationNotification')
  handleAddNotifications(reactivationNotification, store, viewerId)

  const teamInviteNotification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(teamInviteNotification, store, viewerId)

  const removedRequestNotificationId = getInProxy(payload, 'removedRequestNotification', 'id')
  handleRemoveNotifications(removedRequestNotificationId, store, viewerId)

  const requestNotification = payload.getLinkedRecord('requestNotification')
  handleAddNotifications(requestNotification, store, viewerId)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const inviteTeamMembersNotificationOnNext = (
  payload: InviteTeamMembersMutation_notification,
  {atmosphere, history}
) => {
  const {reactivationNotification, requestNotification, teamInviteNotification} = payload
  popTeamInviteNotificationToast(teamInviteNotification, {atmosphere, history})
  popReactivatedNotificationToast(reactivationNotification, {atmosphere})
  popRequestNewUserNotificationToast(requestNotification, {atmosphere, history})
}

export const inviteTeamMembersOrgApprovalUpdater = (payload, store) => {
  const orgApprovalsRemoved = payload.getLinkedRecords('orgApprovalsRemoved')
  handleRemoveOrgApprovals(orgApprovalsRemoved, store)

  const orgApprovalsSent = payload.getLinkedRecords('orgApprovalsSent')
  handleAddOrgApprovals(orgApprovalsSent, store)
}

export const inviteTeamMembersTeamUpdater = (payload, store, viewerId) => {
  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
}

export const inviteTeamMembersTeamMemberUpdater = (payload, store) => {
  const reactivatedTeamMembers = payload.getLinkedRecords('reactivatedTeamMembers')
  handleAddTeamMembers(reactivatedTeamMembers, store)
  const newSoftTeamMembers = payload.getLinkedRecords('newSoftTeamMembers')
  handleAddSoftTeamMembers(newSoftTeamMembers, store)
}

export const inviteTeamMembersTeamMemberOnNext = (payload, {atmosphere}) => {
  popTeamMemberReactivatedToast(payload, {atmosphere})
}

const InviteTeamMembersMutation = (atmosphere, variables, _context, onError, onCompleted) => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('inviteTeamMembers')
      if (!payload) return
      inviteTeamMembersInvitationUpdater(payload, store)
      inviteTeamMembersOrgApprovalUpdater(payload, store)
      inviteTeamMembersTeamMemberUpdater(payload, store)
      inviteTeamMembersTaskUpdater(payload, store, viewerId)
    },
    optimisticUpdater: (store) => {
      // add the invitees as soft team members
      const {invitees, teamId} = variables
      const team = store.get(teamId)
      if (!team) return
      const softTeamMembers = team.getLinkedRecords('softTeamMembers') || []
      const now = new Date().toJSON()
      const newSoftTeamMembers = invitees.map(({email}) => {
        const softTeamMember = createProxyRecord(store, 'SoftTeamMember', {
          email,
          preferredName: email.split('@')[0],
          createdAt: now,
          isActive: true,
          teamId
        })
        softTeamMember.setLinkedRecord(team, 'team')
        return softTeamMember
      })
      const nextSoftTeamMembers = softTeamMembers.concat(newSoftTeamMembers)
      team.setLinkedRecords(nextSoftTeamMembers, 'softTeamMembers')
    },
    onCompleted: (res: InviteTeamMembersMutationResponse, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      const payload = res.inviteTeamMembers
      if (payload) {
        popInvitationToast(payload.invitationsSent, {atmosphere})
        popOrgApprovalToast(payload.orgApprovalsSent, {atmosphere})
        popReactivationToast(payload.reactivatedTeamMembers, {atmosphere})
      }
    },
    onError
  })
}

export default InviteTeamMembersMutation
