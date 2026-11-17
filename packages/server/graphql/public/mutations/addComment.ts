import {generateText, type JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getAllNodesAttributesByType} from '../../../../client/shared/tiptap/getAllNodesAttributesByType'
import {serverTipTapExtensions} from '../../../../client/shared/tiptap/serverTipTapExtensions'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import type {Discussion} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import {convertToTipTap} from '../../../utils/convertToTipTap'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'
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

  const {discussionId, threadSortOrder, isAnonymous, threadParentId} = comment
  const discussion = await dataLoader.get('discussions').load(discussionId)
  if (!discussion) {
    throw new GraphQLError('Invalid discussion thread', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {meetingId} = discussion
  if (!meetingId) {
    throw new GraphQLError('Discussion does not take place in a meeting', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
      plaintextContent: plaintextContent.slice(0, 2000),
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
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, subOptions)
  return data
}

export default addComment
