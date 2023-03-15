import graphql from 'babel-plugin-relay/macro'
import {RouterProps} from 'react-router'
import {requestSubscription} from 'relay-runtime'
import {archiveTimelineEventNotificationUpdater} from '~/mutations/ArchiveTimelineEventMutation'
import {endCheckInNotificationUpdater} from '~/mutations/EndCheckInMutation'
import {endRetrospectiveNotificationUpdater} from '~/mutations/EndRetrospectiveMutation'
import {InvalidateSessionsMutation_notification} from '~/__generated__/InvalidateSessionsMutation_notification.graphql'
import {NotificationSubscription_meetingStageTimeLimitEnd} from '~/__generated__/NotificationSubscription_meetingStageTimeLimitEnd.graphql'
import {NotificationSubscription_paymentRejected} from '~/__generated__/NotificationSubscription_paymentRejected.graphql'
import Atmosphere from '../Atmosphere'
import {acceptTeamInvitationNotificationUpdater} from '../mutations/AcceptTeamInvitationMutation'
import {addOrgMutationNotificationUpdater} from '../mutations/AddOrgMutation'
import {addTeamMutationNotificationUpdater} from '../mutations/AddTeamMutation'
import {
  createTaskNotificationOnNext,
  createTaskNotificationUpdater
} from '../mutations/CreateTaskMutation'
import handleAddNotifications from '../mutations/handlers/handleAddNotifications'
import {
  inviteToTeamNotificationOnNext,
  inviteToTeamNotificationUpdater
} from '../mutations/InviteToTeamMutation'
import {
  removeOrgUserNotificationOnNext,
  removeOrgUserNotificationUpdater
} from '../mutations/RemoveOrgUserMutation'
import {popNotificationToastOnNext} from '../mutations/toasts/popNotificationToast'
import {updateNotificationToastOnNext} from '../mutations/toasts/updateNotificationToast'
import {LocalStorageKey} from '../types/constEnums'
import {OnNextHandler, OnNextHistoryContext, SharedUpdater} from '../types/relayMutations'
import {
  NotificationSubscription as TNotificationSubscription,
  NotificationSubscription$variables,
  NotificationSubscriptionResponse
} from '../__generated__/NotificationSubscription.graphql'
import subscriptionOnNext from './subscriptionOnNext'
import subscriptionUpdater from './subscriptionUpdater'

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
        name
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
      fieldName
      AddedNotification {
        addedNotification {
          ...NotificationPicker_notification @relay(mask: false)
        }
        ...popNotificationToast_notification @relay(mask: false)
      }
      UpdatedNotification {
        updatedNotification {
          ...NotificationPicker_notification @relay(mask: false)
        }
        ...updateNotificationToast_notification @relay(mask: false)
      }

      RemoveIntegrationSearchQuerySuccess {
        ...RemoveJiraServerSearchQueryMutation_notification @relay(mask: false)
      }
      PersistGitHubSearchQuerySuccess {
        ...PersistGitHubSearchQueryMutation_notification @relay(mask: false)
      }
      AddOrgPayload {
        ...AddOrgMutation_notification @relay(mask: false)
      }
      AddTeamPayload {
        ...AddTeamMutation_notification @relay(mask: false)
      }
      ArchiveTimelineEventSuccess {
        ...ArchiveTimelineEventMutation_notification @relay(mask: false)
      }
      SetNotificationStatusPayload {
        ...SetNotificationStatusMutation_notification @relay(mask: false)
      }
      CreateTaskPayload {
        ...CreateTaskMutation_notification @relay(mask: false)
      }
      EndCheckInSuccess {
        ...EndCheckInMutation_notification @relay(mask: false)
      }
      EndRetrospectiveSuccess {
        ...EndRetrospectiveMutation_notification @relay(mask: false)
      }
      InviteToTeamPayload {
        ...InviteToTeamMutation_notification @relay(mask: false)
      }
      RemoveOrgUserPayload {
        ...RemoveOrgUserMutation_notification @relay(mask: false)
      }
      InvalidateSessionsPayload {
        ...InvalidateSessionsMutation_notification @relay(mask: false)
      }
      PersistJiraSearchQuerySuccess {
        ...PersistJiraSearchQueryMutation_notification @relay(mask: false)
      }
      PersistIntegrationSearchQuerySuccess {
        ...PersistJiraServerSearchQueryMutation_notification @relay(mask: false)
      }

      AuthTokenPayload {
        id
      }
      MeetingStageTimeLimitPayload {
        # ScheduledJob Result
        ...NotificationSubscription_meetingStageTimeLimitEnd @relay(mask: false)
      }

      StripeFailPaymentPayload {
        ...NotificationSubscription_paymentRejected @relay(mask: false)
      }

      # ConnectSocket
      User {
        id
        isConnected
        lastSeenAt
      }

      # DisconnectSocket
      DisconnectSocketPayload {
        user {
          id
          isConnected
        }
      }

      # Feature flags
      UpdateFeatureFlagPayload {
        user {
          id
          # add flag here
        }
      }

      # New Feature Broadcasts
      AddNewFeaturePayload {
        newFeature {
          id
          actionButtonCopy
          snackbarMessage
          url
        }
      }

      JiraIssue {
        id
        summary
        descriptionHTML
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
  const {name: meetingName, team, id: meetingId} = meeting
  const {name: teamName} = team
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `meetingStageLimitReached:${meetingId}`,
    autoDismiss: 10,
    message: `${meetingName} for ${teamName} is ready to move forward!`,
    action: {
      label: 'Go there',
      callback: () => {
        history!.push(`/meet/${meetingId}`)
      }
    }
  })
}

const meetingStageTimeLimitUpdater: SharedUpdater<any> = (payload, {store}) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

const stripeFailPaymentNotificationUpdater: SharedUpdater<any> = (payload, {store}) => {
  const notification = payload.getLinkedRecord('notification')
  handleAddNotifications(notification, store)
}

const addNewFeatureNotificationUpdater: SharedUpdater<any> = (payload, {store}) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const newFeature = payload.getLinkedRecord('newFeature')
  viewer?.setLinkedRecord(newFeature, 'newFeature')
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

const addedNotificationUpdater: SharedUpdater<any> = (payload, context) => {
  const notification = payload.getLinkedRecord('addedNotification')
  if (!notification) return
  handleAddNotifications(notification, context.store)
}

const updateHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationNotificationUpdater,
  AddNewFeaturePayload: addNewFeatureNotificationUpdater,
  AddOrgPayload: addOrgMutationNotificationUpdater,
  AddTeamPayload: addTeamMutationNotificationUpdater,
  AddedNotification: addedNotificationUpdater,
  CreateTaskPayload: createTaskNotificationUpdater,
  EndCheckInSuccess: endCheckInNotificationUpdater,
  EndRetrospectiveSuccess: endRetrospectiveNotificationUpdater,
  InviteToTeamPayload: inviteToTeamNotificationUpdater,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitUpdater,
  RemoveOrgUserPayload: removeOrgUserNotificationUpdater,
  StripeFailPaymentPayload: stripeFailPaymentNotificationUpdater,
  ArchiveTimelineEventSuccess: archiveTimelineEventNotificationUpdater
} as const

const onNextHandlers = {
  AuthTokenPayload: authTokenNotificationOnNext,
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RemoveOrgUserPayload: removeOrgUserNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitOnNext,
  InvalidateSessionsPayload: invalidateSessionsNotificationOnNext,
  AddedNotification: popNotificationToastOnNext,
  UpdatedNotification: updateNotificationToastOnNext
} as const

const NotificationSubscription = (
  atmosphere: Atmosphere,
  variables: NotificationSubscription$variables,
  router: {history: RouterProps['history']}
) => {
  atmosphere.registerSubscription(subscription)
  return requestSubscription<TNotificationSubscription>(atmosphere, {
    subscription,
    variables,
    updater: subscriptionUpdater('notificationSubscription', updateHandlers, atmosphere),
    onNext: subscriptionOnNext('notificationSubscription', onNextHandlers, atmosphere, router),
    onCompleted: () => {
      atmosphere.unregisterSub(NotificationSubscription.name, variables)
    }
  })
}
NotificationSubscription.key = 'notification'
export default NotificationSubscription
