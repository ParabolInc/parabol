import graphql from 'babel-plugin-relay/macro'
import type {InvalidateSessionsMutation_notification$data} from '~/__generated__/InvalidateSessionsMutation_notification.graphql'
import type {NotificationSubscription_meetingStageTimeLimitEnd$data} from '~/__generated__/NotificationSubscription_meetingStageTimeLimitEnd.graphql'
import type {NotificationSubscription_paymentRejected$data} from '~/__generated__/NotificationSubscription_paymentRejected.graphql'
import {archiveTimelineEventNotificationUpdater} from '~/mutations/ArchiveTimelineEventMutation'
import {endCheckInNotificationUpdater} from '~/mutations/EndCheckInMutation'
import {endRetrospectiveNotificationUpdater} from '~/mutations/EndRetrospectiveMutation'
import type {
  NotificationSubscription$data,
  NotificationSubscription as TNotificationSubscription
} from '../__generated__/NotificationSubscription.graphql'
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
  removeOrgUsersNotificationOnNext,
  removeOrgUsersNotificationUpdater
} from '../mutations/RemoveOrgUsersMutation'
import {
  removeTeamMemberNotificationOnNext,
  removeTeamMemberNotificationUpdater
} from '../mutations/RemoveTeamMemberMutation'
import {popNotificationToastOnNext} from '../mutations/toasts/popNotificationToast'
import {updateNotificationToastOnNext} from '../mutations/toasts/updateNotificationToast'
import {handleArchivePage} from '../mutations/useArchivePageMutation'
import {handleCreatePage} from '../mutations/useCreatePageMutation'
import {handleUpdatePage} from '../mutations/useUpdatePageMutation'
import type {OnNextHandler, OnNextHistoryContext, SharedUpdater} from '../types/relayMutations'
import {createSubscription} from './createSubscription'

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
      AcceptTeamInvitationPayload {
        ...AcceptTeamInvitationMutationReply @relay(mask: false)
        ...AcceptTeamInvitationMutation_notification @relay(mask: false)
      }
      AddedNotification {
        addedNotification {
          ...NotificationPicker_notification @relay(mask: false)
        }
        ...popNotificationToast_notification @relay(mask: false)
      }
      ArchivePagePayload {
        ...useArchivePageMutation_notification @relay(mask: false)
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
      RemoveOrgUsersSuccess {
        ...RemoveOrgUsersMutation_notification @relay(mask: false)
      }
      RemoveTeamMemberPayload {
        ...RemoveTeamMemberMutation_notification @relay(mask: false)
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

      ToggleFeatureFlagSuccess {
        featureFlag {
          featureName
          enabled
        }
      }
      CreatePagePayload {
        ...useCreatePageMutation_notification @relay(mask: false)
      }
      UpdatePagePayload {
        ...useUpdatePageMutation_notification @relay(mask: false)
      }
      UpdatePageAccessPayload {
        ...useUpdatePageAccessMutation_notification @relay(mask: false)
      }
    }
  }
`

const stripeFailPaymentNotificationOnNext: OnNextHandler<
  NotificationSubscription_paymentRejected$data,
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
  NotificationSubscription_meetingStageTimeLimitEnd$data,
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

const invalidateSessionsNotificationOnNext: OnNextHandler<
  InvalidateSessionsMutation_notification$data,
  OnNextHistoryContext
> = (_payload, {atmosphere, history}) => {
  //atmosphere.setViewer(null)
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

const archivePageNotificationUpdater: SharedUpdater<any> = (payload, context) => {
  const archivedPageId = payload.getValue('pageId')
  const archivedPage = payload.getLinkedRecord('page')
  handleArchivePage(archivedPageId, {
    ...context,
    isHardDelete: !archivedPage
  })
}

const createPageNotificationUpdater: SharedUpdater<any> = (payload, context) => {
  const newPage = payload.getLinkedRecord('page')
  handleCreatePage(newPage, context)
}

const updatePageNotificationUpdater: SharedUpdater<
  NotificationSubscription$data['notificationSubscription']['UpdatePagePayload']
> = (payload, context) => {
  handleUpdatePage(payload, context)
}

const updatePageAccessNotificationUpdater: SharedUpdater<
  NotificationSubscription$data['notificationSubscription']['UpdatePageAccessPayload']
> = (payload, context) => {
  handleUpdatePage(payload, context)
}

const updateHandlers = {
  AcceptTeamInvitationPayload: acceptTeamInvitationNotificationUpdater,
  AddNewFeaturePayload: addNewFeatureNotificationUpdater,
  AddOrgPayload: addOrgMutationNotificationUpdater,
  AddTeamPayload: addTeamMutationNotificationUpdater,
  AddedNotification: addedNotificationUpdater,
  ArchivePagePayload: archivePageNotificationUpdater,
  CreateTaskPayload: createTaskNotificationUpdater,
  CreatePagePayload: createPageNotificationUpdater,
  UpdatePagePayload: updatePageNotificationUpdater,
  UpdatePageAccessPayload: updatePageAccessNotificationUpdater,
  EndCheckInSuccess: endCheckInNotificationUpdater,
  EndRetrospectiveSuccess: endRetrospectiveNotificationUpdater,
  InviteToTeamPayload: inviteToTeamNotificationUpdater,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitUpdater,
  RemoveOrgUsersSuccess: removeOrgUsersNotificationUpdater,
  RemoveTeamMemberPayload: removeTeamMemberNotificationUpdater,
  StripeFailPaymentPayload: stripeFailPaymentNotificationUpdater,
  ArchiveTimelineEventSuccess: archiveTimelineEventNotificationUpdater
} as const

const onNextHandlers = {
  CreateTaskPayload: createTaskNotificationOnNext,
  InviteToTeamPayload: inviteToTeamNotificationOnNext,
  RemoveOrgUsersSuccess: removeOrgUsersNotificationOnNext,
  RemoveTeamMemberPayload: removeTeamMemberNotificationOnNext,
  StripeFailPaymentPayload: stripeFailPaymentNotificationOnNext,
  MeetingStageTimeLimitPayload: meetingStageTimeLimitOnNext,
  InvalidateSessionsPayload: invalidateSessionsNotificationOnNext,
  AddedNotification: popNotificationToastOnNext,
  UpdatedNotification: updateNotificationToastOnNext
} as const

export default createSubscription(subscription, onNextHandlers, updateHandlers)
