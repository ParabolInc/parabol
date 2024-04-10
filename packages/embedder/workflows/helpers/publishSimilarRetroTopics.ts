import {SubscriptionChannel} from '../../../client/types/constEnums'
import makeAppURL from '../../../client/utils/makeAppURL'
import appOrigin from '../../../server/appOrigin'
import getRethink from '../../../server/database/rethinkDriver'
import {DataLoaderInstance} from '../../../server/dataloader/RootDataLoader'
import {isRetroMeeting} from '../../../server/graphql/meetingTypePredicates'
import {
  buildCommentContentBlock,
  createAIComment
} from '../../../server/graphql/mutations/helpers/addAIGeneratedContentToThreads'
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
    dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  ])

  if (!meeting || !isRetroMeeting(meeting)) throw new Error('invalid meeting type')
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

const publishComment = async (meetingId: string, commentId: string) => {
  const data = {commentId, meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data, {}, false)
}

export const publishSimilarRetroTopics = async (
  embeddingsMetadataId: number,
  similarEmbeddings: {embeddingsMetadataId: number; similarity: number}[],
  dataLoader: DataLoaderInstance
) => {
  const r = await getRethink()
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
  await r.table('Comment').insert(relatedDiscussionsComment).run()
  publishComment(meetingId, relatedDiscussionsComment.id)
}
