import {addOrgMutationNotificationUpdater} from 'universal/mutations/AddOrgMutation'
import {addTeamMutationNotificationUpdater} from 'universal/mutations/AddTeamMutation'
import {clearNotificationNotificationUpdater} from 'universal/mutations/ClearNotificationMutation'
import {
  createTaskNotificationOnNext,
  createTaskNotificationUpdater
} from 'universal/mutations/CreateTaskMutation'
import {deleteTaskNotificationUpdater} from 'universal/mutations/DeleteTaskMutation'
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications'
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
import {endNewMeetingNotificationUpdater} from 'universal/mutations/EndNewMeetingMutation'
import {graphql} from 'react-relay'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {OnNextContext, OnNextHandler, UpdaterHandler} from 'universal/types/relayMutations'
import {GraphQLSubscriptionConfig, RecordSourceSelectorProxy} from 'relay-runtime'
import {NotificationSubscriptionResponse} from '__generated__/NotificationSubscription.graphql'
import Atmosphere from 'universal/Atmosphere'

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

type NextHandler = OnNextHandler<NotificationSubscriptionResponse['notificationSubscription']>

const stripeFailPaymentNotificationOnNext: NextHandler = (
  payload: any,
  {atmosphere, history}: OnNextContext
) => {
  if (!payload) return
  const {notification} = payload
  const {organization} = notification
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
  const {meetingType, team} = meeting
  const {id: teamId, name: teamName} = team
  const meetingLabel = meetingTypeToLabel[meetingType]
  const meetingSlug = meetingTypeToSlug[meetingType]
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Time’s up!',
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

const onNextHandlers = {
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RemoveOrgUserPayload: removeOrgUserNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitOnNext
}

const NotificationSubscription = (atmosphere: Atmosphere, _queryVariables, subParams) => {
  const {viewerId} = atmosphere
  return {
    subscription,
    variables: {},
    updater: (store: RecordSourceSelectorProxy<NotificationSubscriptionResponse>) => {
      const payload = store.getRootField('notificationSubscription')
      if (!payload) return
      const type = payload.getValue('__typename')
      const context = {store, atmosphere}
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
          deleteTaskNotificationUpdater(payload, store, viewerId)
          break
        case 'DisconnectSocketPayload':
          disconnectSocketNotificationUpdater(payload, store)
          break
        case 'EndNewMeetingPayload':
          endNewMeetingNotificationUpdater(payload, context)
          break
        case 'InviteToTeamPayload':
          inviteToTeamNotificationUpdater(payload, context)
          break
        case 'User':
          connectSocketUserUpdater(payload, store)
          break
        case 'MeetingStageTimeLimitPayload':
          meetingStageTimeLimitUpdater(payload, context)
          break
        case 'RemoveOrgUserPayload':
          removeOrgUserNotificationUpdater(payload, store, viewerId)
          break
        case 'StripeFailPaymentPayload':
          stripeFailPaymentNotificationUpdater(payload, context)
          break
        default:
          console.error('NotificationSubscription case fail', type)
      }
    },
    onNext: (response) => {
      if (!response) return
      const {notificationSubscription} = response
      const {__typename: type} = notificationSubscription
      const handler = onNextHandlers[type]
      if (handler) {
        handler(notificationSubscription, {...subParams, atmosphere})
      }
    }
  } as GraphQLSubscriptionConfig<NotificationSubscriptionResponse>
}

export default NotificationSubscription
