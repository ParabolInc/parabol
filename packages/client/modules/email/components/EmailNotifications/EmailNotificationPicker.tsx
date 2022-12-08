import graphql from 'babel-plugin-relay/macro'
import {ValueOf} from 'parabol-client/types/generics'
import {EmailNotificationPicker_notification$key} from 'parabol-client/__generated__/EmailNotificationPicker_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import EmailKickedOut from './EmailKickedOut'
import EmailMeetingStageTimeLimitEnd from './EmailMeetingStageTimeLimitEnd'
import EmailPaymentRejected from './EmailPaymentRejected'
import EmailPromoteToBillingLeader from './EmailPromoteToBillingLeader'
import EmailResponseMentioned from './EmailResponseMentioned'
import EmailTaskInvolves from './EmailTaskInvolves'
import EmailTeamArchived from './EmailTeamArchived'
import EmailTeamInvitation from './EmailTeamInvitation'

export const NOTIFICATION_TEMPLATE_TYPE = {
  KICKED_OUT: EmailKickedOut,
  PAYMENT_REJECTED: EmailPaymentRejected,
  TASK_INVOLVES: EmailTaskInvolves,
  PROMOTE_TO_BILLING_LEADER: EmailPromoteToBillingLeader,
  TEAM_ARCHIVED: EmailTeamArchived,
  TEAM_INVITATION: EmailTeamInvitation,
  MEETING_STAGE_TIME_LIMIT_END: EmailMeetingStageTimeLimitEnd,
  RESPONSE_MENTIONED: EmailResponseMentioned
}

interface Props {
  notificationRef: EmailNotificationPicker_notification$key
  appOrigin: string
}

const EmailNotificationPicker = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailNotificationPicker_notification on Notification {
        type
        id
        ...EmailKickedOut_notification
        ...EmailPaymentRejected_notification
        ...EmailTaskInvolves_notification
        ...EmailPromoteToBillingLeader_notification
        ...EmailTeamArchived_notification
        ...EmailTeamInvitation_notification
        ...EmailMeetingStageTimeLimitEnd_notification
        ...EmailResponseMentioned_notification
      }
    `,
    notificationRef
  )
  const {type} = notification
  const SpecificNotification = NOTIFICATION_TEMPLATE_TYPE[type] as ValueOf<
    typeof NOTIFICATION_TEMPLATE_TYPE
  > | null
  return SpecificNotification ? (
    <SpecificNotification appOrigin={appOrigin} notificationRef={notification} />
  ) : null
}

export default EmailNotificationPicker
