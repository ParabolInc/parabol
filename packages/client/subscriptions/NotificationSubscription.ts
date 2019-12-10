import {addOrgMutationNotificationUpdater} from '../mutations/AddOrgMutation'
import {addTeamMutationNotificationUpdater} from '../mutations/AddTeamMutation'
import {clearNotificationNotificationUpdater} from '../mutations/ClearNotificationMutation'
import {
  createTaskNotificationOnNext,
  createTaskNotificationUpdater
} from '../mutations/CreateTaskMutation'
import {deleteTaskNotificationUpdater} from '../mutations/DeleteTaskMutation'
import handleAddNotifications from '../mutations/handlers/handleAddNotifications'
import {
  removeOrgUserNotificationOnNext,
  removeOrgUserNotificationUpdater
} from '../mutations/RemoveOrgUserMutation'
import {
  inviteToTeamNotificationOnNext,
  inviteToTeamNotificationUpdater
} from '../mutations/InviteToTeamMutation'
import {acceptTeamInvitationNotificationUpdater} from '../mutations/AcceptTeamInvitationMutation'
import {endNewMeetingNotificationUpdater} from '../mutations/EndNewMeetingMutation'
import graphql from 'babel-plugin-relay/macro'
import {meetingTypeToLabel, meetingTypeToSlug} from '../utils/meetings/lookups'
import {OnNextHandler, OnNextHistoryContext, UpdaterHandler} from '../types/relayMutations'
import {requestSubscription, Variables} from 'relay-runtime'
import {NotificationSubscriptionResponse} from '../__generated__/NotificationSubscription.graphql'
import Atmosphere from '../Atmosphere'
import {RouterProps} from 'react-router'
import {RecordSourceSelectorProxy} from 'relay-runtime/lib/store/RelayStoreTypes'
import {NotificationSubscription_meetingStageTimeLimitEnd} from '__generated__/NotificationSubscription_meetingStageTimeLimitEnd.graphql'
import {NotificationSubscription_paymentRejected} from '__generated__/NotificationSubscription_paymentRejected.graphql'
import {LocalStorageKey} from '../types/constEnums'
import {InvalidateSessionsMutation_notification} from '__generated__/InvalidateSessionsMutation_notification.graphql'

graphql`
  fragment NotificationSubscription_paymentRejected on StripeFailPaymentPayload {
    paymentRejectedNotification: notification {
      type
      organization {
        id
        name
      }
      ...PaymentRejected_notification
    }
  }
`
graphql`
  fragment NotificationSubscription_meetingStageTimeLimitEnd on MeetingStageTimeLimitPayload {
    timeLimitNotification: notification {
      ...MeetingStageTimeLimitEnd_notification
      type
      meeting {
        id
        meetingType
        team {
          id
          name
        }
      }
    }
  }
`

const subscription = graphql`
  subscription NotificationSubscription {
    notificationSubscription {
      __typename
      ...AddOrgMutation_notification @relay(mask: false)
      ...AddTeamMutation_notification @relay(mask: false)
      ...ClearNotificationMutation_notification @relay(mask: false)
      ...CreateTaskMutation_notification @relay(mask: false)
      ...DeleteTaskMutation_notification @relay(mask: false)
      ...EndNewMeetingMutation_notification @relay(mask: false)
      ...InviteToTeamMutation_notification @relay(mask: false)
      ...RemoveOrgUserMutation_notification @relay(mask: false)
      ...InvalidateSessionsMutation_notification @relay(mask: false)
      ... on AuthTokenPayload {
        id
      }

      # ScheduledJob Result
      ...NotificationSubscription_meetingStageTimeLimitEnd @relay(mask: false)
      ...NotificationSubscription_paymentRejected @relay(mask: false)

      # ConnectSocket
      ... on User {
        id
        isConnected
        lastSeenAt
      }

      # DisconnectSocket
      ... on DisconnectSocketPayload {
        user {
          id
          isConnected
        }
      }

      # Feature flags
      ... on AddFeatureFlagPayload {
        user {
          id
          featureFlags {
            jira
            video
          }
        }
      }

      # New Feature Broadcasts
      ... on AddNewFeaturePayload {
        newFeature {
          id
          copy
          url
        }
      }
    }
  }
`

type NextHandler = OnNextHandler<
  NotificationSubscriptionResponse['notificationSubscription'],
  OnNextHistoryContext
>

const stripeFailPaymentNotificationOnNext: OnNextHandler<
  NotificationSubscription_paymentRejected,
  OnNextHistoryContext
> = (payload, {atmosphere, history}) => {
  if (!payload) return
  const {paymentRejectedNotification} = payload
  const {organization} = paymentRejectedNotification
  if (!organization) return
  const {id: orgId, name: orgName} = organization
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `rejectedPayment:${orgId}`,
    autoDismiss: 10,
    message: `Your credit card for ${orgName} was rejected.`,
    action: {
      label: 'Fix it!',
      callback: () => {
        history!.push(`/me/organizations/${orgId}`)
      }
    }
  })
}

// there's a bug in relay compiler that only shows part of the discriminated union
const meetingStageTimeLimitOnNext: OnNextHandler<
  NotificationSubscription_meetingStageTimeLimitEnd,
  OnNextHistoryContext
> = (payload: any, {atmosphere, history}) => {
  if (!payload || payload.__typename !== 'MeetingStageTimeLimitPayload') return
  const {timeLimitNotification} = payload
  const {meeting} = timeLimitNotification
  const {meetingType, team, id: meetingId} = meeting
  const {id: teamId, name: teamName} = team
  const meetingLabel = meetingTypeToLabel[meetingType]
  const meetingSlug = meetingTypeToSlug[meetingType]
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingStageLimitReached:${meetingId}`,
    autoDismiss: 10,
    message: `Your ${meetingLabel} meeting for ${teamName} is ready to move forward!`,
    action: {
      label: 'Go there',
      callback: () => {
        history!.push(`/${meetingSlug}/${teamId}`)
      }
    }
  })
}

const meetingStageTimeLimitUpdater: UpdaterHandler = (payload, {store}) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

const stripeFailPaymentNotificationUpdater: UpdaterHandler = (payload, {store}) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

const addNewFeatureNotificationUpdater = (payload, {store}) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const newFeature = payload.getLinkedRecord('newFeature')
  viewer.setLinkedRecord(newFeature, 'newFeature')
}

const authTokenNotificationOnNext: NextHandler = (payload, {atmosphere}) => {
  if (!payload) return
  const {id} = payload as any
  atmosphere.setAuthToken(id)
}

const invalidateSessionsNotificationOnNext: OnNextHandler<
  InvalidateSessionsMutation_notification,
  OnNextHistoryContext
> = (_payload, {atmosphere, history}) => {
  window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: 'logOutJWT',
    message: 'You’ve been logged out from another device',
    autoDismiss: 5
  })
  setTimeout(() => {
    atmosphere.close()
    history.replace('/')
  })
}

const onNextHandlers = {
  AuthTokenPayload: authTokenNotificationOnNext,
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RemoveOrgUserPayload: removeOrgUserNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitOnNext,
  InvalidateSessionsPayload: invalidateSessionsNotificationOnNext
}

const NotificationSubscription = (
  atmosphere: Atmosphere,
  variables: Variables,
  router: {history: RouterProps['history']}
) => {
  return requestSubscription<NotificationSubscriptionResponse>(atmosphere, {
    subscription,
    variables,
    updater: (store) => {
      const payload = store.getRootField('notificationSubscription') as any
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {store: store as RecordSourceSelectorProxy<any>, atmosphere}
      switch (type as string) {
        case 'AcceptTeamInvitationPayload':
          acceptTeamInvitationNotificationUpdater(payload, context)
          break
        case 'AddFeatureFlagPayload':
          break
        case 'AddNewFeaturePayload':
          addNewFeatureNotificationUpdater(payload, context)
          break
        case 'AddOrgPayload':
          addOrgMutationNotificationUpdater(payload, context)
          break
        case 'AddTeamPayload':
          addTeamMutationNotificationUpdater(payload, context)
          break
        case 'ClearNotificationPayload':
          clearNotificationNotificationUpdater(payload, store)
          break
        case 'CreateTaskPayload':
          createTaskNotificationUpdater(payload as any, context)
          break
        case 'DeleteTaskPayload':
          deleteTaskNotificationUpdater(payload, store)
          break
        case 'DisconnectSocketPayload':
          break
        case 'EndNewMeetingPayload':
          endNewMeetingNotificationUpdater(payload, context)
          break
        case 'InviteToTeamPayload':
          inviteToTeamNotificationUpdater(payload, context)
          break
        case 'User':
          break
        case 'MeetingStageTimeLimitPayload':
          meetingStageTimeLimitUpdater(payload, context)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserNotificationUpdater(payload, store)
          break
        case 'StripeFailPaymentPayload':
          stripeFailPaymentNotificationUpdater(payload, context)
          break
        default:
          console.error('NotificationSubscription case fail', type)
      }
    },
    onNext: (result) => {
      if (!result) return
      const {notificationSubscription} = result
      const {__typename: type} = notificationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(notificationSubscription, {...router, atmosphere})
      }
    },
    onCompleted: () => {
      atmosphere.unregisterSub(NotificationSubscription.name, variables)
    }
  })
}

export default NotificationSubscription
