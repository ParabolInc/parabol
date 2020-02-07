import React, {Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import lazyPreload from 'utils/lazyPreload'
import {NotificationEnum} from 'types/graphql'
import {ValueOf} from 'types/generics'
import {NotificationPicker_notification} from '__generated__/NotificationPicker_notification.graphql'

const typePicker = {
  [NotificationEnum.KICKED_OUT]: lazyPreload(() =>
    import(/* webpackChunkName: 'KickedOut' */ './KickedOut')
  ),
  [NotificationEnum.PAYMENT_REJECTED]: lazyPreload(() =>
    import(/* webpackChunkName: 'PaymentRejected' */ './PaymentRejected')
  ),
  [NotificationEnum.TASK_INVOLVES]: lazyPreload(() =>
    import(/* webpackChunkName: 'TaskInvolves' */ './TaskInvolves')
  ),
  [NotificationEnum.PROMOTE_TO_BILLING_LEADER]: lazyPreload(() =>
    import(/* webpackChunkName: 'PromoteToBillingLeader' */ './PromoteToBillingLeader')
  ),
  [NotificationEnum.TEAM_ARCHIVED]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamArchived' */ './TeamArchived')
  ),
  [NotificationEnum.TEAM_INVITATION]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamInvitation' */ './TeamInvitationNotification')
  ),
  [NotificationEnum.MEETING_STAGE_TIME_LIMIT_END]: lazyPreload(() =>
    import(/* webpackChunkName: 'MeetingStageTimeLimitEnd' */ './MeetingStageTimeLimitEnd')
  )
}

interface Props {
  notification: NotificationPicker_notification
}

const NotificationPicker = (props: Props) => {
  const {notification} = props
  const {type} = notification
  const SpecificNotification = typePicker[type] as ValueOf<typeof typePicker>
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
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...TeamArchived_notification
      ...TeamInvitationNotification_notification
      ...MeetingStageTimeLimitEnd_notification
    }
  `
})
