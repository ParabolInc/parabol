import type {mapDiscussionMentionedToToast_notification$data} from '../../__generated__/mapDiscussionMentionedToToast_notification.graphql'
import type {mapMentionedToToast_notification$data} from '../../__generated__/mapMentionedToToast_notification.graphql'
import type {mapPromptToJoinOrgToToast_notification$data} from '../../__generated__/mapPromptToJoinOrgToToast_notification.graphql'
import type {mapRequestToJoinOrgToToast_notification$data} from '../../__generated__/mapRequestToJoinOrgToToast_notification.graphql'
import type {mapResponseMentionedToToast_notification$data} from '../../__generated__/mapResponseMentionedToToast_notification.graphql'
import type {mapResponseRepliedToToast_notification$data} from '../../__generated__/mapResponseRepliedToToast_notification.graphql'
import type {mapTeamHealthResponseDueToToast_notification$data} from '../../__generated__/mapTeamHealthResponseDueToToast_notification.graphql'
import type {mapTeamsLimitReminderToToast_notification$data} from '../../__generated__/mapTeamsLimitReminderToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import mapDiscussionMentionedToToast from './mapDiscussionMentionedToToast'
import mapMentionedToToast from './mapMentionedToToast'
import mapPromptToJoinOrgToToast from './mapPromptToJoinOrgToToast'
import mapRequestToJoinOrgToToast from './mapRequestToJoinOrgToToast'
import mapResponseMentionedToToast from './mapResponseMentionedToToast'
import mapResponseRepliedToToast from './mapResponseRepliedToToast'
import mapTeamHealthResponseDueToToast from './mapTeamHealthResponseDueToToast'
import mapTeamsLimitReminderToToast from './mapTeamsLimitReminderToToast'

export type UnmaskedNotification<T> = Omit<T, ' $fragmentType'>

type AliasedNotification<T> = UnmaskedNotification<T> | null | undefined

interface ToastableNotification {
  readonly mapDiscussionMentionedToToast_notification?: AliasedNotification<mapDiscussionMentionedToToast_notification$data>
  readonly mapMentionedToToast_notification?: AliasedNotification<mapMentionedToToast_notification$data>
  readonly mapPromptToJoinOrgToToast_notification?: AliasedNotification<mapPromptToJoinOrgToToast_notification$data>
  readonly mapRequestToJoinOrgToToast_notification?: AliasedNotification<mapRequestToJoinOrgToToast_notification$data>
  readonly mapResponseMentionedToToast_notification?: AliasedNotification<mapResponseMentionedToToast_notification$data>
  readonly mapResponseRepliedToToast_notification?: AliasedNotification<mapResponseRepliedToToast_notification$data>
  readonly mapTeamHealthResponseDueToToast_notification?: AliasedNotification<mapTeamHealthResponseDueToToast_notification$data>
  readonly mapTeamsLimitReminderToToast_notification?: AliasedNotification<mapTeamsLimitReminderToToast_notification$data>
}

const mapNotificationToToast = (
  notification: ToastableNotification,
  context: OnNextNavigateContext
): Snack | null => {
  const {
    mapDiscussionMentionedToToast_notification: discussionMentioned,
    mapMentionedToToast_notification: mentioned,
    mapPromptToJoinOrgToToast_notification: promptToJoinOrg,
    mapRequestToJoinOrgToToast_notification: requestToJoinOrg,
    mapResponseMentionedToToast_notification: responseMentioned,
    mapResponseRepliedToToast_notification: responseReplied,
    mapTeamHealthResponseDueToToast_notification: teamHealthResponseDue,
    mapTeamsLimitReminderToToast_notification: teamsLimitReminder
  } = notification
  if (discussionMentioned) return mapDiscussionMentionedToToast(discussionMentioned, context)
  if (mentioned) return mapMentionedToToast(mentioned, context)
  if (promptToJoinOrg) return mapPromptToJoinOrgToToast(promptToJoinOrg, context)
  if (requestToJoinOrg) return mapRequestToJoinOrgToToast(requestToJoinOrg, context)
  if (responseMentioned) return mapResponseMentionedToToast(responseMentioned, context)
  if (responseReplied) return mapResponseRepliedToToast(responseReplied, context)
  if (teamHealthResponseDue) return mapTeamHealthResponseDueToToast(teamHealthResponseDue, context)
  if (teamsLimitReminder) return mapTeamsLimitReminderToToast(teamsLimitReminder, context)
  return null
}

export default mapNotificationToToast
