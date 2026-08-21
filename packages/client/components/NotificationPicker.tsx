import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {NotificationPicker_notification$key} from '~/__generated__/NotificationPicker_notification.graphql'
import lazyPreload from '~/utils/lazyPreload'

const typePicker = {
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
  TEAMS_LIMIT_REMINDER: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamsLimitReminderNotification' */ './TeamsLimitReminderNotification'
      )
  ),
  TEAMS_LIMIT_EXCEEDED: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamsLimitExceededNotification' */ './TeamsLimitExceededNotification'
      )
  ),
  PROMPT_TO_JOIN_ORG: lazyPreload(
    () =>
      import(/* webpackChunkName: 'PromptToJoinOrgNotification' */ './PromptToJoinOrgNotification')
  ),
  REQUEST_TO_JOIN_ORG: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'RequestToJoinOrgNotification' */ './RequestToJoinOrgNotification'
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
  MENTIONED: lazyPreload(() => import(/* webpackChunkName: 'Mentioned' */ './Mentioned')),
  RESPONSE_REPLIED: lazyPreload(
    () => import(/* webpackChunkName: 'ResponseReplied' */ './ResponseReplied')
  ),
  PAGE_ACCESS_GRANTED: lazyPreload(
    () => import(/* webpackChunkName: 'PageAccessGranted' */ './PageAccessGranted')
  ),
  PAGE_ACCESS_REQUESTED: lazyPreload(
    () => import(/* webpackChunkName: 'PageAccessRequested' */ './PageAccessRequested')
  )
}

interface Props {
  notification: NotificationPicker_notification$key
}

const NotificationPicker = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment NotificationPicker_notification on Notification {
        type
        id
        ...DiscussionMentioned_notification @alias
        ...KickedOut_notification @alias
        ...PaymentRejected_notification @alias
        ...TaskInvolves_notification @alias
        ...PromoteToBillingLeader_notification @alias
        ...TeamArchived_notification @alias
        ...TeamInvitationNotification_notification @alias
        ...MeetingStageTimeLimitEnd_notification @alias
        ...ResponseMentioned_notification @alias
        ...Mentioned_notification @alias
        ...ResponseReplied_notification @alias
        ...TeamsLimitReminderNotification_notification @alias
        ...TeamsLimitExceededNotification_notification @alias
        ...PromptToJoinOrgNotification_notification @alias
        ...RequestToJoinOrgNotification_notification @alias
        ...PageAccessGranted_notification @alias
        ...PageAccessRequested_notification @alias
      }
    `,
    notificationRef
  )
  const renderNotification = () => {
    const {
      DiscussionMentioned_notification: discussionMentioned,
      KickedOut_notification: kickedOut,
      PaymentRejected_notification: paymentRejected,
      TaskInvolves_notification: taskInvolves,
      PromoteToBillingLeader_notification: promoteToBillingLeader,
      TeamArchived_notification: teamArchived,
      TeamInvitationNotification_notification: teamInvitation,
      MeetingStageTimeLimitEnd_notification: meetingStageTimeLimitEnd,
      ResponseMentioned_notification: responseMentioned,
      Mentioned_notification: mentioned,
      ResponseReplied_notification: responseReplied,
      TeamsLimitReminderNotification_notification: teamsLimitReminder,
      TeamsLimitExceededNotification_notification: teamsLimitExceeded,
      PromptToJoinOrgNotification_notification: promptToJoinOrg,
      RequestToJoinOrgNotification_notification: requestToJoinOrg,
      PageAccessGranted_notification: pageAccessGranted,
      PageAccessRequested_notification: pageAccessRequested
    } = notification
    if (discussionMentioned)
      return <typePicker.DISCUSSION_MENTIONED notification={discussionMentioned} />
    if (kickedOut) return <typePicker.KICKED_OUT notification={kickedOut} />
    if (paymentRejected) return <typePicker.PAYMENT_REJECTED notification={paymentRejected} />
    if (taskInvolves) return <typePicker.TASK_INVOLVES notification={taskInvolves} />
    if (promoteToBillingLeader)
      return <typePicker.PROMOTE_TO_BILLING_LEADER notification={promoteToBillingLeader} />
    if (teamArchived) return <typePicker.TEAM_ARCHIVED notification={teamArchived} />
    if (teamInvitation) return <typePicker.TEAM_INVITATION notification={teamInvitation} />
    if (meetingStageTimeLimitEnd)
      return <typePicker.MEETING_STAGE_TIME_LIMIT_END notification={meetingStageTimeLimitEnd} />
    if (responseMentioned) return <typePicker.RESPONSE_MENTIONED notification={responseMentioned} />
    if (mentioned) return <typePicker.MENTIONED notification={mentioned} />
    if (responseReplied) return <typePicker.RESPONSE_REPLIED notification={responseReplied} />
    if (teamsLimitReminder)
      return <typePicker.TEAMS_LIMIT_REMINDER notification={teamsLimitReminder} />
    if (teamsLimitExceeded)
      return <typePicker.TEAMS_LIMIT_EXCEEDED notification={teamsLimitExceeded} />
    if (promptToJoinOrg) return <typePicker.PROMPT_TO_JOIN_ORG notification={promptToJoinOrg} />
    if (requestToJoinOrg) return <typePicker.REQUEST_TO_JOIN_ORG notification={requestToJoinOrg} />
    if (pageAccessGranted)
      return <typePicker.PAGE_ACCESS_GRANTED notification={pageAccessGranted} />
    if (pageAccessRequested)
      return <typePicker.PAGE_ACCESS_REQUESTED notification={pageAccessRequested} />
    return null
  }
  return <Suspense fallback={''}>{renderNotification()}</Suspense>
}

export default NotificationPicker
