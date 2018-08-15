import {commitMutation} from 'react-relay'
import {showInfo, showSuccess} from 'universal/modules/toast/ducks/toastDuck'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleAddOrgApprovals from 'universal/mutations/handlers/handleAddOrgApprovals'
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers'
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals'
import popTeamInviteNotificationToast from 'universal/mutations/toasts/popTeamInviteNotificationToast'
import getInProxy from 'universal/utils/relay/getInProxy'
import handleAddSoftTeamMembers from 'universal/mutations/handlers/handleAddSoftTeamMembers'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

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
      ...AddedToTeam_notification @relay(mask: false)
    }
    teamInviteNotification {
      type
      ...TeamInvite_notification @relay(mask: false)
    }
    removedRequestNotification {
      id
    }
    requestNotification {
      type
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

const popInvitationToast = (payload, dispatch) => {
  const invitationsSent = payload.getLinkedRecords('invitationsSent')
  const emails = getInProxy(invitationsSent, 'email')
  if (!emails) return
  const emailStr = emails.join(', ')
  dispatch(
    showSuccess({
      title: 'Invitation sent!',
      message: `An invitation has been sent to ${emailStr}`
    })
  )
}

const popReactivationToast = (reactivatedTeamMembers, dispatch) => {
  const names = getInProxy(reactivatedTeamMembers, 'preferredName')
  if (!names) return
  const isSingular = names.length === 1
  const nameStr = names.join(', ')
  const message = isSingular
    ? `${nameStr} used to be on this team, so they were automatically approved`
    : `The following team members have been reinstated: ${nameStr}`
  dispatch(
    showSuccess({
      title: 'Back in it!',
      message
    })
  )
}

const popReactivatedNotificationToast = (reactivationNotification, {dispatch, environment}) => {
  const teamName = getInProxy(reactivationNotification, 'team', 'name')
  if (!teamName) return
  const notificationId = getInProxy(reactivationNotification, 'id')
  dispatch(
    showInfo({
      autoDismiss: 10,
      title: 'Congratulations!',
      message: `You’ve been added to team ${teamName}`,
      action: {
        label: 'Great!',
        callback: () => {
          ClearNotificationMutation(environment, notificationId)
        }
      }
    })
  )
}

const popOrgApprovalToast = (payload, dispatch) => {
  const orgApprovalsSent = payload.getLinkedRecords('orgApprovalsSent')
  const emails = getInProxy(orgApprovalsSent, 'email')
  if (!emails) return
  const [firstEmail] = emails
  const emailStr = emails.join(', ')
  dispatch(
    showSuccess({
      title: 'Request sent to admin',
      message:
        emails.length === 1
          ? `A request to add ${firstEmail} has been sent to your organization admin`
          : `The following invitations are awaiting approval from your organization admin: ${emailStr}`
    })
  )
}

const popTeamMemberReactivatedToast = (payload, dispatch) => {
  // pop 1 toast per reactivation. simple for now
  const teamName = getInProxy(payload, 'team', 'name')
  const reactivatedTeamMembers = payload.getLinkedRecords('reactivatedTeamMembers')
  const names = getInProxy(reactivatedTeamMembers, 'preferredName')
  names.forEach((name) => {
    dispatch(
      showInfo({
        autoDismiss: 10,
        title: 'They’re back!',
        message: `${name} has rejoined ${teamName}`
      })
    )
  })
}

const popRequestNewUserNotificationToast = (requestNotification, {dispatch, history}) => {
  const inviterName = getInProxy(requestNotification, 'inviter', 'preferredName')
  if (!inviterName) return
  dispatch(
    showInfo({
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
  )
}

export const inviteTeamMembersInvitationUpdater = (payload, store) => {
  const invitationsSent = payload.getLinkedRecords('invitationsSent')
  handleAddInvitations(invitationsSent, store)
}

export const inviteTeamMembersNotificationUpdater = (payload, store, viewerId, options) => {
  const reactivationNotification = payload.getLinkedRecord('reactivationNotification')
  handleAddNotifications(reactivationNotification, store, viewerId)
  popReactivatedNotificationToast(reactivationNotification, options)

  const teamInviteNotification = payload.getLinkedRecord('teamInviteNotification')
  handleAddNotifications(teamInviteNotification, store, viewerId)
  popTeamInviteNotificationToast(teamInviteNotification, options)

  const removedRequestNotificationId = getInProxy(payload, 'removedRequestNotification', 'id')
  handleRemoveNotifications(removedRequestNotificationId, store, viewerId)

  const requestNotification = payload.getLinkedRecord('requestNotification')
  handleAddNotifications(requestNotification, store, viewerId)
  popRequestNewUserNotificationToast(requestNotification, options)

  const team = payload.getLinkedRecord('team')
  handleAddTeams(team, store, viewerId)
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

export const inviteTeamMembersTeamMemberUpdater = (payload, store, dispatch, isMutator) => {
  const reactivatedTeamMembers = payload.getLinkedRecords('reactivatedTeamMembers')
  handleAddTeamMembers(reactivatedTeamMembers, store)
  const newSoftTeamMembers = payload.getLinkedRecords('newSoftTeamMembers')
  handleAddSoftTeamMembers(newSoftTeamMembers, store)
  if (reactivatedTeamMembers) {
    if (isMutator) {
      popReactivationToast(reactivatedTeamMembers, dispatch)
    } else {
      popTeamMemberReactivatedToast(payload, dispatch)
    }
  }
}

const InviteTeamMembersMutation = (environment, variables, dispatch, onError, onCompleted) => {
  const {viewerId} = environment
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('inviteTeamMembers')
      if (!payload) return
      inviteTeamMembersInvitationUpdater(payload, store)
      popInvitationToast(payload, dispatch)
      inviteTeamMembersOrgApprovalUpdater(payload, store)
      popOrgApprovalToast(payload, dispatch)
      inviteTeamMembersTeamMemberUpdater(payload, store, dispatch, true)
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
    onCompleted,
    onError
  })
}

export default InviteTeamMembersMutation
