import {generateText, type JSONContent} from '@tiptap/core'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getAllNodesAttributesByType} from '../../../../client/shared/tiptap/getAllNodesAttributesByType'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import GenericMeetingPhase, {
  NewMeetingPhaseTypeEnum
} from '../../../database/types/GenericMeetingPhase'
import GenericMeetingStage from '../../../database/types/GenericMeetingStage'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {Discussion} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import {MutationResolvers} from '../resolverTypes'
import publishNotification from './helpers/publishNotification'

const getMentionNotifications = (
  jsonContent: JSONContent,
  viewerId: string,
  discussion: Discussion,
  commentId: string,
  meetingId: string
) => {
  const subjectUserId =
    discussion.discussionTopicType === 'teamPromptResponse'
      ? TeamMemberId.split(discussion.discussionTopicId).userId
      : null

  return getAllNodesAttributesByType<{id: string; label: string}>(jsonContent, 'mention')
    .filter((mention) => ![viewerId, subjectUserId].includes(mention.id))
    .map((mention) => ({
      id: generateUID(),
      type: 'DISCUSSION_MENTIONED' as const,
      userId: mention.id,
      meetingId: meetingId,
      authorId: viewerId,
      commentId,
      discussionId: discussion.id
    }))
}

const addComment: MutationResolvers['addComment'] = async (
  _source,
  {comment},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
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
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembers').load(meetingMemberId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!viewerMeetingMember) {
    return {error: {message: 'Not a member of the meeting'}}
  }

  // VALIDATION
  const content = convertToTipTap(comment.content)
  const plaintextContent = generateText(content, serverTipTapExtensions)

  const commentId = generateUID()
  await getKysely()
    .insertInto('Comment')
    .values({
      id: commentId,
      content,
      isAnonymous: isAnonymous ?? undefined,
      plaintextContent,
      createdBy: viewerId,
      threadSortOrder,
      threadParentId,
      discussionId
    })
    .returning('id')
    .execute()

  if (discussion.discussionTopicType === 'teamPromptResponse') {
    const {userId: responseUserId} = TeamMemberId.split(discussion.discussionTopicId)

    if (responseUserId !== viewerId) {
      const notification = {
        id: generateUID(),
        type: 'RESPONSE_REPLIED' as const,
        userId: responseUserId,
        meetingId: meetingId,
        authorId: viewerId,
        commentId
      }

      await pg.insertInto('Notification').values(notification).execute()

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
    await pg.insertInto('Notification').values(notificationsToAdd).execute()
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
