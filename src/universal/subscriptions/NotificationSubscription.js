import {
  addOrgMutationNotificationOnNext,
  addOrgMutationNotificationUpdater
} from 'universal/mutations/AddOrgMutation'
import {
  addTeamMutationNotificationOnNext,
  addTeamMutationNotificationUpdater
} from 'universal/mutations/AddTeamMutation'
import {
  approveToOrgNotificationOnNext,
  approveToOrgNotificationUpdater
} from 'universal/mutations/ApproveToOrgMutation'
import {cancelApprovalNotificationUpdater} from 'universal/mutations/CancelApprovalMutation'
import {clearNotificationNotificationUpdater} from 'universal/mutations/ClearNotificationMutation'
import {
  createTaskNotificationOnNext,
  createTaskNotificationUpdater
} from 'universal/mutations/CreateTaskMutation'
import {deleteTaskNotificationUpdater} from 'universal/mutations/DeleteTaskMutation'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import {
  inviteTeamMembersNotificationOnNext,
  inviteTeamMembersNotificationUpdater
} from 'universal/mutations/InviteTeamMembersMutation'
import {
  rejectOrgApprovalNotificationOnNext,
  rejectOrgApprovalNotificationUpdater
} from 'universal/mutations/RejectOrgApprovalMutation'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {
  removeOrgUserNotificationOnNext,
  removeOrgUserNotificationUpdater
} from 'universal/mutations/RemoveOrgUserMutation'
import {
  inviteToTeamNotificationOnNext,
  inviteToTeamNotificationUpdater
} from 'universal/mutations/InviteToTeamMutation'
import {acceptTeamInvitationNotificationUpdater} from 'universal/mutations/AcceptTeamInvitationMutation'

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ...AcceptTeamInvitationMutation_notification @relay(mask: false)
      ...AddOrgMutation_notification @relay(mask: false)
      ...AddTeamMutation_notification @relay(mask: false)
      ...ApproveToOrgMutation_notification @relay(mask: false)
      ...CancelApprovalMutation_notification @relay(mask: false)
      ...ClearNotificationMutation_notification @relay(mask: false)
      ...CreateTaskMutation_notification @relay(mask: false)
      ...DeleteTaskMutation_notification @relay(mask: false)
      ...InviteTeamMembersMutation_notification @relay(mask: false)
      ...InviteToTeamMutation_notification @relay(mask: false)
      ...RemoveOrgUserMutation_notification @relay(mask: false)
      ...RejectOrgApprovalMutation_notification @relay(mask: false)
      ...UpdateUserProfileMutation_notification @relay(mask: false)

      # ConnectSocket
      ... on User {
        id
        isConnected
        tms
      }

      # DisconnectSocket
      ... on DisconnectSocketPayload {
        user {
          id
          tms
        }
      }
      # Stripe webhooks
      ... on StripeFailPaymentPayload {
        notification {
          type
          ...PaymentRejected_notification @relay(mask: false)
        }
      }

      # Feature flags
      ... on AddFeatureFlagPayload {
        user {
          id
          featureFlags {
            retro
          }
        }
      }
    }
  }
`

const connectSocketUserUpdater = (payload, store) => {
  const isConnected = payload.getValue('isConnected')
  const userId = payload.getValue('id')
  const teamIds = payload.getValue('tms')
  if (!teamIds) return
  const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
  teamMemberIds.forEach((teamMemberId) => {
    const teamMember = store.get(teamMemberId)
    if (!teamMember) return
    teamMember.setValue(isConnected, 'isConnected')
  })
}

const disconnectSocketNotificationUpdater = (payload, store) => {
  const user = payload.getLinkedRecord('user')
  const userId = user.getValue('id')
  const teamIds = user.getValue('tms')
  if (!teamIds) return
  const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
  teamMemberIds.forEach((teamMemberId) => {
    const teamMember = store.get(teamMemberId)
    if (!teamMember) return
    teamMember.setValue(false, 'isConnected')
  })
}

const stripeFailPaymentNotificationOnNext = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {organization} = payload
  if (!organization) return
  const {id: orgId, name: orgName} = organization
  atmosphere.eventEmitter.emit('addToast', {
    level: 'warning',
    autoDismiss: 10,
    title: 'Oh no!',
    message: `Your credit card for ${orgName} was rejected.`,
    action: {
      label: 'Fix it!',
      callback: () => {
        history.push(`/me/organizations/${orgId}`)
      }
    }
  })
}
const stripeFailPaymentNotificationUpdater = (payload, store, viewerId) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store, viewerId)
}

const onNextHandlers = {
  AddOrgPayload: addOrgMutationNotificationOnNext,
  AddTeamPayload: addTeamMutationNotificationOnNext,
  ApproveToOrgPayload: approveToOrgNotificationOnNext,
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteTeamMembersPayload: inviteTeamMembersNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RejectOrgApprovalPayload: rejectOrgApprovalNotificationOnNext,
  RemoveOrgUserPayload: removeOrgUserNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext
}

const NotificationSubscription = (atmosphere, queryVariables, subParams) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    updater: (store) => {
      const payload = store.getRootField('notificationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'AcceptTeamInvitationPayload':
          acceptTeamInvitationNotificationUpdater(payload, {store, atmosphere})
          break
        case 'AddFeatureFlagPayload':
          break
        case 'AddOrgPayload':
          addOrgMutationNotificationUpdater(payload, store, viewerId)
          break
        case 'AddTeamPayload':
          addTeamMutationNotificationUpdater(payload, store, viewerId)
          break
        case 'ApproveToOrgPayload':
          approveToOrgNotificationUpdater(payload, store, viewerId)
          break
        case 'CancelApprovalPayload':
          cancelApprovalNotificationUpdater(payload, store, viewerId)
          break
        case 'ClearNotificationPayload':
          clearNotificationNotificationUpdater(payload, store, viewerId)
          break
        case 'CreateTaskPayload':
          createTaskNotificationUpdater(payload, store, viewerId)
          break
        case 'DeleteTaskPayload':
          deleteTaskNotificationUpdater(payload, store, viewerId)
          break
        case 'DisconnectSocketPayload':
          disconnectSocketNotificationUpdater(payload, store)
          break
        case 'InviteTeamMembersPayload':
          inviteTeamMembersNotificationUpdater(payload, store, viewerId)
          break
        case 'InviteToTeamPayload':
          inviteToTeamNotificationUpdater(payload, {atmosphere, store})
          break
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalNotificationUpdater(payload, store, viewerId)
          break
        case 'User':
          connectSocketUserUpdater(payload, store)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserNotificationUpdater(payload, store, viewerId)
          break
        case 'StripeFailPaymentPayload':
          stripeFailPaymentNotificationUpdater(payload, store, viewerId)
          break
        case 'UpdateUserProfilePayload':
          break
        default:
          console.error('NotificationSubscription case fail', type)
      }
    },
    onNext: ({notificationSubscription}) => {
      const {__typename: type} = notificationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(notificationSubscription, {...subParams, atmosphere})
      }
    }
  }
}

export default NotificationSubscription
