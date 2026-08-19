import graphql from 'babel-plugin-relay/macro'
import type {EmailNotificationPicker_notification$key} from 'parabol-client/__generated__/EmailNotificationPicker_notification.graphql'
import {useFragment} from 'react-relay'
import EmailDiscussionMentioned from './EmailDiscussionMentioned'
import EmailKickedOut from './EmailKickedOut'
import EmailMeetingStageTimeLimitEnd from './EmailMeetingStageTimeLimitEnd'
import EmailPaymentRejected from './EmailPaymentRejected'
import EmailPromoteToBillingLeader from './EmailPromoteToBillingLeader'
import EmailResponseMentioned from './EmailResponseMentioned'
import EmailResponseReplied from './EmailResponseReplied'
import EmailTaskInvolves from './EmailTaskInvolves'
import EmailTeamArchived from './EmailTeamArchived'
import EmailTeamInvitation from './EmailTeamInvitation'

export const NOTIFICATION_TEMPLATE_TYPE = {
  DISCUSSION_MENTIONED: EmailDiscussionMentioned,
  KICKED_OUT: EmailKickedOut,
  PAYMENT_REJECTED: EmailPaymentRejected,
  TASK_INVOLVES: EmailTaskInvolves,
  PROMOTE_TO_BILLING_LEADER: EmailPromoteToBillingLeader,
  TEAM_ARCHIVED: EmailTeamArchived,
  TEAM_INVITATION: EmailTeamInvitation,
  MEETING_STAGE_TIME_LIMIT_END: EmailMeetingStageTimeLimitEnd,
  RESPONSE_MENTIONED: EmailResponseMentioned,
  RESPONSE_REPLIED: EmailResponseReplied
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
        ...EmailDiscussionMentioned_notification @alias
        ...EmailKickedOut_notification @alias
        ...EmailPaymentRejected_notification @alias
        ...EmailTaskInvolves_notification @alias
        ...EmailPromoteToBillingLeader_notification @alias
        ...EmailTeamArchived_notification @alias
        ...EmailTeamInvitation_notification @alias
        ...EmailMeetingStageTimeLimitEnd_notification @alias
        ...EmailResponseMentioned_notification @alias
        ...EmailResponseReplied_notification @alias
      }
    `,
    notificationRef
  )
  const {
    EmailDiscussionMentioned_notification: discussionMentioned,
    EmailKickedOut_notification: kickedOut,
    EmailPaymentRejected_notification: paymentRejected,
    EmailTaskInvolves_notification: taskInvolves,
    EmailPromoteToBillingLeader_notification: promoteToBillingLeader,
    EmailTeamArchived_notification: teamArchived,
    EmailTeamInvitation_notification: teamInvitation,
    EmailMeetingStageTimeLimitEnd_notification: meetingStageTimeLimitEnd,
    EmailResponseMentioned_notification: responseMentioned,
    EmailResponseReplied_notification: responseReplied
  } = notification
  if (discussionMentioned)
    return <EmailDiscussionMentioned appOrigin={appOrigin} notificationRef={discussionMentioned} />
  if (kickedOut) return <EmailKickedOut notificationRef={kickedOut} />
  if (paymentRejected)
    return <EmailPaymentRejected appOrigin={appOrigin} notificationRef={paymentRejected} />
  if (taskInvolves)
    return <EmailTaskInvolves appOrigin={appOrigin} notificationRef={taskInvolves} />
  if (promoteToBillingLeader)
    return (
      <EmailPromoteToBillingLeader appOrigin={appOrigin} notificationRef={promoteToBillingLeader} />
    )
  if (teamArchived) return <EmailTeamArchived notificationRef={teamArchived} />
  if (teamInvitation)
    return <EmailTeamInvitation appOrigin={appOrigin} notificationRef={teamInvitation} />
  if (meetingStageTimeLimitEnd)
    return (
      <EmailMeetingStageTimeLimitEnd
        appOrigin={appOrigin}
        notificationRef={meetingStageTimeLimitEnd}
      />
    )
  if (responseMentioned)
    return <EmailResponseMentioned appOrigin={appOrigin} notificationRef={responseMentioned} />
  if (responseReplied)
    return <EmailResponseReplied appOrigin={appOrigin} notificationRef={responseReplied} />
  return null
}

export default EmailNotificationPicker
