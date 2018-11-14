import {showWarning} from 'universal/modules/toast/ducks/toastDuck'
import {
  addOrgMutationNotificationOnNext,
  addOrgMutationNotificationUpdater
} from 'universal/mutations/AddOrgMutation'
import {addTeamMutationNotificationUpdater} from 'universal/mutations/AddTeamMutation'
import {approveToOrgNotificationUpdater} from 'universal/mutations/ApproveToOrgMutation'
import {cancelApprovalNotificationUpdater} from 'universal/mutations/CancelApprovalMutation'
import {cancelTeamInviteNotificationUpdater} from 'universal/mutations/CancelTeamInviteMutation'
import {clearNotificationNotificationUpdater} from 'universal/mutations/ClearNotificationMutation'
import {createTaskNotificationUpdater} from 'universal/mutations/CreateTaskMutation'
import {deleteTaskNotificationUpdater} from 'universal/mutations/DeleteTaskMutation'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
import {inviteTeamMembersNotificationUpdater} from 'universal/mutations/InviteTeamMembersMutation'
import {rejectOrgApprovalNotificationUpdater} from 'universal/mutations/RejectOrgApprovalMutation'
import getInProxy from 'universal/utils/relay/getInProxy'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {removeOrgUserNotificationUpdater} from 'universal/mutations/RemoveOrgUserMutation'

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ...AddOrgMutation_notification @relay(mask: false)
      ...AddTeamMutation_notification @relay(mask: false)
      ...ApproveToOrgMutation_notification @relay(mask: false)
      ...CancelApprovalMutation_notification @relay(mask: false)
      ...CancelTeamInviteMutation_notification @relay(mask: false)
      ...ClearNotificationMutation_notification @relay(mask: false)
      ...CreateTaskMutation_notification @relay(mask: false)
      ...DeleteTaskMutation_notification @relay(mask: false)
      ...InviteTeamMembersMutation_notification @relay(mask: false)
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

const popPaymentFailedToast = (payload, {dispatch, history}) => {
  const orgId = getInProxy(payload, 'organization', 'id')
  const orgName = getInProxy(payload, 'organization', 'name')
  // TODO add brand and last 4
  dispatch(
    showWarning({
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
  )
}

const stripeFailPaymentNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store, viewerId)
  popPaymentFailedToast(payload, options)
}

const onNextHandlers = {
  AddOrgCreatorPayload: addOrgMutationNotificationOnNext
}

const NotificationSubscription = (environment, queryVariables, subParams) => {
  const {dispatch, history, location} = subParams
  const {viewerId} = environment
  return {
    subscription,
    updater: (store) => {
      const options = {dispatch, environment, history, location, store}
      const payload = store.getRootField('notificationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      switch (type) {
        case 'AddFeatureFlagPayload':
          break
        case 'AddOrgPayload':
          addOrgMutationNotificationUpdater(payload, store, viewerId)
          break
        case 'AddTeamPayload':
          addTeamMutationNotificationUpdater(payload, store, viewerId, options)
          break
        case 'ApproveToOrgPayload':
          approveToOrgNotificationUpdater(payload, store, viewerId, options)
          break
        case 'CancelApprovalPayload':
          cancelApprovalNotificationUpdater(payload, store, viewerId)
          break
        case 'CancelTeamInvitePayload':
          cancelTeamInviteNotificationUpdater(payload, store, viewerId)
          break
        case 'ClearNotificationPayload':
          clearNotificationNotificationUpdater(payload, store, viewerId)
          break
        case 'CreateTaskPayload':
          createTaskNotificationUpdater(payload, store, viewerId, options)
          break
        case 'DeleteTaskPayload':
          deleteTaskNotificationUpdater(payload, store, viewerId)
          break
        case 'DisconnectSocketPayload':
          disconnectSocketNotificationUpdater(payload, store)
          break
        case 'InviteTeamMembersPayload':
          inviteTeamMembersNotificationUpdater(payload, store, viewerId, options)
          break
        case 'RejectOrgApprovalPayload':
          rejectOrgApprovalNotificationUpdater(payload, store, viewerId, options)
          break
        case 'User':
          connectSocketUserUpdater(payload, store)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserNotificationUpdater(payload, store, viewerId, options)
          break
        case 'StripeFailPaymentPayload':
          stripeFailPaymentNotificationUpdater(payload, store, viewerId, options)
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
        handler(notificationSubscription, {...subParams, environment})
      }
    }
  }
}

export default NotificationSubscription
