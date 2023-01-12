import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload, {LazyExoticPreload} from '~/utils/lazyPreload'
import {
  NotificationEnum,
  NotificationPicker_notification
} from '~/__generated__/NotificationPicker_notification.graphql'

const typePicker: Record<NotificationEnum, LazyExoticPreload<any>> = {
  DISCUSSION_MENTIONED: lazyPreload(
    () => import(/* webpackChunkName: 'DiscussionMentioned' */ './DiscussionMentioned')
  ),
  KICKED_OUT: lazyPreload(() => import(/* webpackChunkName: 'KickedOut' */ './KickedOut')),
  PAYMENT_REJECTED: lazyPreload(
    () => import(/* webpackChunkName: 'PaymentRejected' */ './PaymentRejected')
  ),
  TASK_INVOLVES: lazyPreload(() => import(/* webpackChunkName: 'TaskInvolves' */ './TaskInvolves')),
  PROMOTE_TO_BILLING_LEADER: lazyPreload(
    () => import(/* webpackChunkName: 'PromoteToBillingLeader' */ './PromoteToBillingLeader')
  ),
  TEAMS_LIMIT_EXCEEDED: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamsLimitExceededNotification' */ './TeamsLimitExceededNotification'
      )
  ),
  TEAM_ARCHIVED: lazyPreload(() => import(/* webpackChunkName: 'TeamArchived' */ './TeamArchived')),
  TEAM_INVITATION: lazyPreload(
    () => import(/* webpackChunkName: 'TeamInvitation' */ './TeamInvitationNotification')
  ),
  MEETING_STAGE_TIME_LIMIT_END: lazyPreload(
    () => import(/* webpackChunkName: 'MeetingStageTimeLimitEnd' */ './MeetingStageTimeLimitEnd')
  ),
  RESPONSE_MENTIONED: lazyPreload(
    () => import(/* webpackChunkName: 'ResponseMentioned' */ './ResponseMentioned')
  ),
  RESPONSE_REPLIED: lazyPreload(
    () => import(/* webpackChunkName: 'ResponseReplied' */ './ResponseReplied')
  )
}

interface Props {
  notification: NotificationPicker_notification
}

const NotificationPicker = (props: Props) => {
  const {notification} = props
  const {type} = notification
  const SpecificNotification = typePicker[type]
  return (
    <Suspense fallback={''}>
      <SpecificNotification notification={notification} />
    </Suspense>
  )
}

export default createFragmentContainer(NotificationPicker, {
  notification: graphql`
    fragment NotificationPicker_notification on Notification {
      type
      id
      ...DiscussionMentioned_notification
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...TeamArchived_notification
      ...TeamInvitationNotification_notification
      ...MeetingStageTimeLimitEnd_notification
      ...ResponseMentioned_notification
      ...ResponseReplied_notification
      ...TeamsLimitExceededNotification_notification
    }
  `
})
