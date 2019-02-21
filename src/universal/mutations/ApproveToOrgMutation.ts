import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn'
import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals'
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn'
import getInProxy from 'universal/utils/relay/getInProxy'
import {ApproveToOrgMutation_notification} from '__generated__/ApproveToOrgMutation_notification.graphql'
import popTeamInviteNotificationToast from './toasts/popTeamInviteNotificationToast'

graphql`
  fragment ApproveToOrgMutation_organization on ApproveToOrgPayload {
    removedRequestNotifications {
      id
    }
  }
`

graphql`
  fragment ApproveToOrgMutation_orgApproval on ApproveToOrgPayload {
    removedOrgApprovals {
      id
      teamId
    }
  }
`

graphql`
  fragment ApproveToOrgMutation_invitation on ApproveToOrgPayload {
    newInvitations {
      id
      email
      teamId
      updatedAt
    }
  }
`

graphql`
  fragment ApproveToOrgMutation_notification on ApproveToOrgPayload {
    inviteeApprovedNotifications {
      id
      type
      ...InviteeApproved_notification @relay(mask: false)
    }
    teamInviteNotifications {
      type
      id
      team {
        name
      }
      inviter {
        preferredName
      }
      ...TeamInvite_notification @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation ApproveToOrgMutation($email: String!, $orgId: ID!) {
    approveToOrg(email: $email, orgId: $orgId) {
      error {
        message
      }
      ...ApproveToOrgMutation_organization @relay(mask: false)
      ...ApproveToOrgMutation_orgApproval @relay(mask: false)
      ...ApproveToOrgMutation_invitation @relay(mask: false)
    }
  }
`

const popInviteeApprovedToast = (payload: ApproveToOrgMutation_notification, {atmosphere}) => {
  const notifications = payload.inviteeApprovedNotifications
  if (!notifications) return
  const inviteeEmails = notifications.map((notification) => notification.inviteeEmail)
  if (!inviteeEmails || inviteeEmails.length === 0) return
  // the server reutrns a notification for each team the invitee was approved to, but we only need 1 toast
  const [inviteeEmail] = inviteeEmails
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Approved!',
    message: `${inviteeEmail} has been approved by your organization. We just sent them an invitation.`,
    action: {
      label: 'Great!',
      callback: () => {
        const notificationIds = notifications.map((notification) => notification.id)
        notificationIds.forEach((notificationId) => {
          ClearNotificationMutation(atmosphere, notificationId)
        })
      }
    }
  })
}

export const approveToOrgOrganizationUpdater = (payload, store, viewerId) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications')
  const notificationIds = getInProxy(removedRequestNotifications, 'id')
  handleRemoveNotifications(notificationIds, store, viewerId)
}

export const approveToOrgOrgApprovalUpdater = (payload, store) => {
  const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals')
  handleRemoveOrgApprovals(removedOrgApprovals, store)
}

export const approveToOrgInvitationUpdater = (payload, store) => {
  const newInvitations = payload.getLinkedRecords('newInvitations')
  handleAddInvitations(newInvitations, store)
}

export const approveToOrgNotificationUpdater = (payload, store, viewerId) => {
  const notifications = payload.getLinkedRecords('inviteeApprovedNotifications')
  handleAddNotifications(notifications, store, viewerId)
  const teamInviteNotifications = payload.getLinkedRecords('teamInviteNotifications')
  handleAddNotifications(teamInviteNotifications, store, viewerId)
}

export const approveToOrgNotificationOnNext = (
  payload: ApproveToOrgMutation_notification,
  {atmosphere, history}
) => {
  popInviteeApprovedToast(payload, {atmosphere})
  const {teamInviteNotifications} = payload
  if (teamInviteNotifications) {
    teamInviteNotifications.forEach((notification) => {
      popTeamInviteNotificationToast(notification, {atmosphere, history})
    })
  }
}

const ApproveToOrgMutation = (atmosphere, email, orgId, onError, onCompleted): Disposable => {
  const {viewerId} = atmosphere
  return commitMutation(atmosphere, {
    mutation,
    variables: {email, orgId},
    updater: (store) => {
      const payload = store.getRootField('approveToOrg')
      if (!payload) return
      approveToOrgOrganizationUpdater(payload, store, viewerId)
      approveToOrgOrgApprovalUpdater(payload, store)
      approveToOrgInvitationUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId)
      const conn = getNotificationsConn(viewer)
      const notifications = filterNodesInConn(
        conn,
        (node) => node.getValue('inviteeEmail') === email && node.getValue('orgId') === orgId
      )
      const notificationIds = getInProxy(notifications, 'id')
      handleRemoveNotifications(notificationIds, store, viewerId)
    },
    onCompleted,
    onError
  })
}

export default ApproveToOrgMutation
