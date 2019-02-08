import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications'
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals'
import getInProxy from 'universal/utils/relay/getInProxy'
import handleRemoveSoftTeamMembers from 'universal/mutations/handlers/handleRemoveSoftTeamMembers'
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks'
import {RejectOrgApprovalMutation_notification} from '__generated__/RejectOrgApprovalMutation_notification.graphql'

graphql`
  fragment RejectOrgApprovalMutation_orgApproval on RejectOrgApprovalPayload {
    removedOrgApprovals {
      id
      teamId
    }
  }
`

graphql`
  fragment RejectOrgApprovalMutation_notification on RejectOrgApprovalPayload {
    deniedNotifications {
      type
      ...DenyNewUser_notification @relay(mask: false)
    }
    removedRequestNotifications {
      id
    }
  }
`

graphql`
  fragment RejectOrgApprovalMutation_teamMember on RejectOrgApprovalPayload {
    removedSoftTeamMembers {
      id
      teamId
    }
  }
`

graphql`
  fragment RejectOrgApprovalMutation_task on RejectOrgApprovalPayload {
    archivedSoftTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`
const mutation = graphql`
  mutation RejectOrgApprovalMutation($notificationId: ID!, $reason: String!) {
    rejectOrgApproval(notificationId: $notificationId, reason: $reason) {
      error {
        message
      }
      ...RejectOrgApprovalMutation_orgApproval @relay(mask: false)
      ...RejectOrgApprovalMutation_notification @relay(mask: false)
    }
  }
`

export const rejectOrgApprovalNotificationOnNext = (
  payload: RejectOrgApprovalMutation_notification,
  {atmosphere, history}
) => {
  if (!payload) return
  const notifications = payload.deniedNotifications
  if (!notifications || notifications.length === 0) return
  const inviteeEmails = notifications.map((notification) => notification.inviteeEmail)
  const [email] = inviteeEmails
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Oh no!',
    message: `${email} was denied to join the team.`,
    action: {
      label: 'Find out why',
      callback: () => {
        history.push('/me/notifications')
      }
    }
  })
}
export const rejectOrgApprovalOrgApprovalUpdater = (payload, store) => {
  const removedOrgApprovals = payload.getLinkedRecords('removedOrgApprovals')
  handleRemoveOrgApprovals(removedOrgApprovals, store)
}

export const rejectOrgApprovalNotificationUpdater = (payload, store, viewerId) => {
  const removedRequestNotifications = payload.getLinkedRecords('removedRequestNotifications')
  const notificationIds = getInProxy(removedRequestNotifications, 'id')
  handleRemoveNotifications(notificationIds, store, viewerId)

  const deniedNotifications = payload.getLinkedRecords('deniedNotifications')
  handleAddNotifications(deniedNotifications, store, viewerId)
}

export const rejectOrgApprovalTeamMemberUpdater = (payload, store) => {
  const removedSoftTeamMembers = payload.getLinkedRecords('removedSoftTeamMembers')
  handleRemoveSoftTeamMembers(removedSoftTeamMembers, store)
}

export const rejectOrgApprovalTaskUpdater = (payload, store, viewerId) => {
  const archivedSoftTasks = payload.getLinkedRecords('archivedSoftTasks')
  handleUpsertTasks(archivedSoftTasks, store, viewerId)
}

const RejectOrgApprovalMutation = (environment, variables, onError, onCompleted): Disposable => {
  const {viewerId} = environment
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('rejectOrgApproval')
      if (!payload) return
      rejectOrgApprovalOrgApprovalUpdater(payload, store)
      rejectOrgApprovalNotificationUpdater(payload, store, viewerId)
      rejectOrgApprovalTeamMemberUpdater(payload, store)
      rejectOrgApprovalTaskUpdater(payload, store, viewerId)
    },
    optimisticUpdater: () => {
      // Do not be optimistic because that'll close the modal
    },
    onCompleted,
    onError
  })
}

export default RejectOrgApprovalMutation
