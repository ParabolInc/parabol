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

      ... on AuthTokenPayload {
        id
      }

      # ConnectSocket
      ... on User {
        id
        isConnected
      }

      # DisconnectSocket
      ... on DisconnectSocketPayload {
        user {
          id
          isConnected
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

      # ScheduledJob Result
      ... on MeetingStageTimeLimitPayload {
        notification {
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
    }
  }
`

type NextHandler = OnNextHandler<
  NotificationSubscriptionResponse['notificationSubscription'],
  OnNextHistoryContext
>

const stripeFailPaymentNotificationOnNext: NextHandler = (payload: any, {atmosphere, history}) => {
  if (!payload) return
  const {notification} = payload
  const {organization} = notification
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
const meetingStageTimeLimitOnNext: NextHandler = (payload: any, {atmosphere, history}) => {
  if (!payload || payload.__typename !== 'MeetingStageTimeLimitPayload') return
  const {notification} = payload
  const {meeting} = notification
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

const onNextHandlers = {
  AuthTokenPayload: authTokenNotificationOnNext,
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RemoveOrgUserPayload: removeOrgUserNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitOnNext
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
