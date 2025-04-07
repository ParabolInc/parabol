import {SubscriptionChannel} from '../../../client/types/constEnums'
import makeAppURL from '../../../client/utils/makeAppURL'
import appOrigin from '../../../server/appOrigin'
import {DataLoaderInstance} from '../../../server/dataloader/RootDataLoader'
import type {DataLoaderWorker} from '../../../server/graphql/graphql'
import {
  buildCommentContentBlock,
  createAIComment
} from '../../../server/graphql/mutations/helpers/addAIGeneratedContentToThreads'
import getKysely from '../../../server/postgres/getKysely'
import getPhase from '../../../server/utils/getPhase'
import publish from '../../../server/utils/publish'

const makeSimilarDiscussionLink = async (
  similarDiscussion: {embeddingsMetadataId: number; similarity: number},
  dataLoader: DataLoaderInstance
) => {
  const {embeddingsMetadataId, similarity} = similarDiscussion
  const metadata = await dataLoader.get('embeddingsMetadata').loadNonNull(embeddingsMetadataId)
  const {refId: discussionId} = metadata
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  const {meetingId, discussionTopicId: reflectionGroupId} = discussion
  const [meeting, reflectionGroup] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionGroups').loadNonNull(reflectionGroupId)
  ])

  if (!meeting || meeting.meetingType !== 'retrospective') throw new Error('invalid meeting type')
  const {phases, name: meetingName} = meeting
  const {title: topic} = reflectionGroup
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const stageIdx = stages
    .sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
    .findIndex((stage) => stage.discussionId === discussionId)

  const url = makeAppURL(appOrigin, `meet/${meetingId}/discuss/${stageIdx + 1}`)

  return (
    `<a href="${url}">` +
    `${meetingName} – ${topic} (score: ${Math.trunc(100 * similarity)})` +
    `</a>`
  )
}

const publishComment = async (
  meetingId: string,
  commentId: string,
  dataLoader: DataLoaderWorker
) => {
  const data = {commentId, meetingId}
  const operationId = dataLoader.share()
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, {operationId})
}

export const publishSimilarRetroTopics = async (
  embeddingsMetadataId: number,
  similarEmbeddings: {embeddingsMetadataId: number; similarity: number}[],
  dataLoader: DataLoaderWorker
) => {
  const pg = getKysely()
  const links = await Promise.all(
    similarEmbeddings.map((se) => makeSimilarDiscussionLink(se, dataLoader))
  )
  const listItems = links.map((link) => `<li>${link}</li>`).join('\n')
  const metadata = await dataLoader.get('embeddingsMetadata').loadNonNull(embeddingsMetadataId)
  const {refId: discussionId} = metadata
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  const {meetingId} = discussion
  const relatedDiscussionsComment = createAIComment(
    discussionId,
    buildCommentContentBlock('🤖 Related Discussions', `<ul>${listItems}</ul>`),
    2
  )
  await pg
    .insertInto('Comment')
    .values({
      id: relatedDiscussionsComment.id,
      content: relatedDiscussionsComment.content,
      plaintextContent: relatedDiscussionsComment.plaintextContent,
      createdBy: relatedDiscussionsComment.createdBy,
      threadSortOrder: relatedDiscussionsComment.threadSortOrder,
      discussionId: relatedDiscussionsComment.discussionId
    })
    .execute()
  publishComment(meetingId, relatedDiscussionsComment.id, dataLoader)
}
