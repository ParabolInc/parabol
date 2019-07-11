import React, {Suspense} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {NotificationRow_notification} from '__generated__/NotificationRow_notification.graphql'
import {NotificationEnum} from 'universal/types/graphql'
import lazyPreload from 'universal/utils/lazyPreload'
import {ValueOf} from 'types/generics'

const typePicker = {
  [NotificationEnum.KICKED_OUT]: lazyPreload(() =>
    import(/* webpackChunkName: 'KickedOut' */ 'universal/modules/notifications/components/KickedOut')
  ),
  [NotificationEnum.PAYMENT_REJECTED]: lazyPreload(() =>
    import(/* webpackChunkName: 'PaymentRejected' */ 'universal/modules/notifications/components/PaymentRejected/PaymentRejected')
  ),
  [NotificationEnum.TASK_INVOLVES]: lazyPreload(() =>
    import(/* webpackChunkName: 'TaskInvolves' */ 'universal/modules/notifications/components/TaskInvolves')
  ),
  [NotificationEnum.PROMOTE_TO_BILLING_LEADER]: lazyPreload(() =>
    import(/* webpackChunkName: 'PromoteToBillingLeader' */ 'universal/modules/notifications/components/PromoteToBillingLeader/PromoteToBillingLeader')
  ),
  [NotificationEnum.TEAM_ARCHIVED]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamArchived' */ 'universal/modules/notifications/components/TeamArchived/TeamArchived')
  ),
  [NotificationEnum.TEAM_INVITATION]: lazyPreload(() =>
    import(/* webpackChunkName: 'TeamInvitation' */ 'universal/modules/notifications/components/TeamInvitation')
  ),
  [NotificationEnum.MEETING_STAGE_TIME_LIMIT_END]: lazyPreload(() =>
    import(/* webpackChunkName: 'MeetingStageTimeLimitEnd' */ 'universal/modules/notifications/components/MeetingStageTimeLimitEnd')
  )
}

interface Props {
  notification: NotificationRow_notification
}

const NotificationRow = (props: Props) => {
  const {notification} = props
  const {type} = notification
  const SpecificNotification = typePicker[type] as ValueOf<typeof typePicker>
  return (
    <Suspense fallback={''}>
      <SpecificNotification notification={notification} />
    </Suspense>
  )
}

export default createFragmentContainer(NotificationRow, {
  notification: graphql`
    fragment NotificationRow_notification on Notification {
      type
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...TeamArchived_notification
      ...TeamInvitation_notification
      ...MeetingStageTimeLimitEnd_notification
    }
  `
})
