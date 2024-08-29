import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import normalizeRawDraftJS from 'parabol-client/validation/normalizeRawDraftJS'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import extractTextFromDraftString from '../../../../client/utils/draftjs/extractTextFromDraftString'
import getTypeFromEntityMap from '../../../../client/utils/draftjs/getTypeFromEntityMap'
import getRethink from '../../../database/rethinkDriver'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import NotificationDiscussionMentioned from '../../../database/types/NotificationDiscussionMentioned'
import NotificationResponseReplied from '../../../database/types/NotificationResponseReplied'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {IGetDiscussionsByIdsQueryResult} from '../../../postgres/queries/generated/getDiscussionsByIdsQuery'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'

const getMentionNotifications = (
  content: string,
  viewerId: string,
  discussion: IGetDiscussionsByIdsQueryResult,
  commentId: string,
  meetingId: string
) => {
  let parsedContent: any
  try {
    parsedContent = JSON.parse(content)
  } catch {
    // If we can't parse the content, assume no new notifications.
    return []
  }

  const {entityMap} = parsedContent
  return getTypeFromEntityMap('MENTION', entityMap)
    .filter((mentionedUserId) => {
      if (mentionedUserId === viewerId) {
        return false
      }

      if (discussion.discussionTopicType === 'teamPromptResponse') {
        const {userId: responseUserId} = TeamMemberId.split(discussion.discussionTopicId)
        if (responseUserId === mentionedUserId) {
          // The mentioned user will already receive a 'RESPONSE_REPLIED' notification for this
          // comment
          return false
        }
      }

      // :TODO: (jmtaber129): Consider limiting these to when the mentionee is *not* on the
      // relevant page.
      return true
    })
    .map(
      (mentioneeUserId) =>
        new NotificationDiscussionMentioned({
          userId: mentioneeUserId,
          meetingId: meetingId,
          authorId: viewerId,
          commentId,
          discussionId: discussion.id
        })
    )
}

const addComment: MutationResolvers['addComment'] = async (
  _source,
  {comment},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const {discussionId, threadSortOrder, isAnonymous, threadParentId} = comment
  const discussion = await dataLoader.get('discussions').load(discussionId)
  if (!discussion) {
    return {error: {message: 'Invalid discussion thread'}}
  }
  const {meetingId} = discussion
  if (!meetingId) {
    return {error: {message: 'Discussion does not take place in a meeting'}}
  }
  const meetingMemberId = MeetingMemberId.join(meetingId, viewerId)
  const [meeting, viewerMeetingMember, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('meetingMembers').load(meetingMemberId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!viewerMeetingMember) {
    return {error: {message: 'Not a member of the meeting'}}
  }

  // VALIDATION
  const content = normalizeRawDraftJS(comment.content)

  const commentId = generateUID()
  await getKysely()
    .insertInto('Comment')
    .values({
      id: commentId,
      content,
      plaintextContent: extractTextFromDraftString(content),
      createdBy: viewerId,
      threadSortOrder,
      discussionId
    })
    .returning('id')
    .execute()

  if (discussion.discussionTopicType === 'teamPromptResponse') {
    const {userId: responseUserId} = TeamMemberId.split(discussion.discussionTopicId)

    if (responseUserId !== viewerId) {
      const notification = new NotificationResponseReplied({
        userId: responseUserId,
        meetingId: meetingId,
        authorId: viewerId,
        commentId
      })

      await r.table('Notification').insert(notification).run()

      IntegrationNotifier.sendNotificationToUser?.(dataLoader, notification.id, notification.userId)
      publishNotification(notification, subOptions)
    }
  }

  const notificationsToAdd = getMentionNotifications(
    content,
    viewerId,
    discussion,
    commentId,
    meetingId
  )

  if (notificationsToAdd.length) {
    await r.table('Notification').insert(notificationsToAdd).run()
    notificationsToAdd.forEach((notification) => {
      publishNotification(notification, subOptions)
    })
  }

  const data = {commentId, meetingId}
  const {phases} = meeting!
  const threadablePhases = [
    'discuss',
    'agendaitems',
    'ESTIMATE',
    'RESPONSES'
  ] as NewMeetingPhaseTypeEnum[]
  const containsThreadablePhase = phases.find(({phaseType}: GenericMeetingPhase) =>
    threadablePhases.includes(phaseType)
  )!
  const {stages} = containsThreadablePhase
  const isAsync = stages.some((stage: GenericMeetingStage) => stage.isAsync)
  analytics.commentAdded(viewer, meeting, !!isAnonymous, isAsync, !!threadParentId)
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, subOptions)
  return data
}

export default addComment
