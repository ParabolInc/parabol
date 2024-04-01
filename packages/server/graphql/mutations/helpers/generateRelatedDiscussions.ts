import {SubscriptionChannel} from '../../../../client/types/constEnums'
import makeAppURL from '../../../../client/utils/makeAppURL'
import {
  AbstractEmbeddingsModel,
  EmbeddingsTable
} from '../../../../embedder/ai_models/AbstractEmbeddingsModel'
import getModelManager from '../../../../embedder/ai_models/ModelManager'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import {createTextFromRetrospectiveDiscussionTopic} from '../../../../embedder/indexing/retrospectiveDiscussionTopic'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {isRetroMeeting} from '../../meetingTypePredicates'
import {buildCommentContentBlock, createAIComment} from './addAIGeneratedContentToThreads'

const MAX_CANDIDATES = 10
const MAX_RESULTS = 3
const SIMILARITY_THRESHOLD = 0.67
const RERANK_THRESHOLD = 0.7
const RERANK_MULTIPLE = 3

/*
 * Overview on how we find related discussions:
 *
 * A previous discussion could be fully related (similarity=1), not related
 * (similarity=0), opposite (similarity=-1), or any place between 1..0..-1.
 *
 * We create an embeddingVector for the current retro discussion topic, then
 * fetch up to MAX_CANDIDATES that are greater than or equal
 * to SIMILARITY_THRESHOLD.
 *
 * We create a new embeddingVector that emphasizes only the reflections from the
 * topic and use this to re-rank the initial results by:
 *
 * newSimilarity = initialSimilarity +
 *   (rerankSimilarity - RERANK_THRESHOLD) * RERANK_MULTIPLE
 *
 * This amplifies the role reflection content plays in matches, making similar
 * reflections boost matches and de-emphasize matches that otherwise might be
 * based on similar template prompts, authorship, etc.
 *
 */

interface SimilarDiscussion {
  embeddingId: number
  similarity: number
  discussionId: string
}

const rerankSimilarDiscussions = async (
  discussionId: string,
  similarDiscussions: SimilarDiscussion[],
  dataLoader: DataLoaderWorker
) => {
  const fullText = await createTextFromRetrospectiveDiscussionTopic(
    discussionId,
    dataLoader,
    true // only return reflection & discussion content
  )
  const embeddingsModel = [...getModelManager().embeddingModels][0]?.[1]
  if (!embeddingsModel) return []
  const embeddingVector = await (embeddingsModel as AbstractEmbeddingsModel).getEmbedding(fullText)
  if (embeddingVector instanceof Error) return []
  const embeddingVectorStr = numberVectorToString(embeddingVector)
  const rerankIds = similarDiscussions.map((sd) => sd.embeddingId)
  const pg = getKysely()
  const embeddingsTable = embeddingsModel.tableName
  const embeddingsWithSimilarities = await pg
    .selectFrom(embeddingsTable as EmbeddingsTable)
    .select(({eb, val, parens}) => [
      'id as embeddingId',
      eb(val(1), '-', parens('embedding' as any, '<=>' as any, embeddingVectorStr)).as('similarity')
    ])
    .where('id', 'in', rerankIds)
    .execute()

  // console.log(`SD INPUTS: ${JSON.stringify(similarDiscussions)}`)
  // console.log(`RERANK QUERY: ${JSON.stringify(query)}`)

  const results = embeddingsWithSimilarities.map((e) => {
    const {embeddingId, similarity} = e
    const similarDiscussion = similarDiscussions.find((sd) => sd.embeddingId === embeddingId)!
    return {
      ...similarDiscussion,
      similarity: Math.min(
        // Limit the upper bound to 0.999..
        0.999999999,
        // Limit the lower bound to -0.999..
        Math.max(
          -0.999999999,
          similarDiscussion!.similarity + (similarity - RERANK_THRESHOLD) * RERANK_MULTIPLE
        )
      )
    }
  })

  // console.log(`RERANK RESULTS: ${JSON.stringify(results)}`)

  return results
}

const getSimilarDiscussions = async (discussionId: string, dataLoader: DataLoaderWorker) => {
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  const {teamId} = discussion
  const fullText = await createTextFromRetrospectiveDiscussionTopic(discussionId, dataLoader)
  const modelManager = getModelManager()
  if (!modelManager) return []

  // for this demo, we're just going to use the highest priority embedding model:
  const embeddingsModel = [...modelManager.embeddingModels][0]?.[1]
  if (!embeddingsModel) return []
  const embeddingVector = await embeddingsModel.getEmbedding(fullText)
  if (embeddingVector instanceof Error) return []
  const embeddingVectorStr = numberVectorToString(embeddingVector)
  const pg = getKysely()
  const embeddingsTable = embeddingsModel.tableName
  return pg
    .with('CosineSimilarity', (pg) =>
      pg
        .selectFrom([embeddingsTable as EmbeddingsTable, 'EmbeddingsMetadata'])
        .select(({eb, val, parens}) => [
          'id as embeddingId',
          'embeddingsMetadataId',
          'refId as discussionId',
          eb(val(1), '-', parens('embedding' as any, '<=>' as any, embeddingVectorStr)).as(
            'similarity'
          )
        ])
        .innerJoin('EmbeddingsMetadata', `embeddingsMetadataId`, 'EmbeddingsMetadata.id')
        .where('objectType', '=', 'retrospectiveDiscussionTopic')
        .where('teamId', '=', teamId)
    )
    .selectFrom('CosineSimilarity')
    .select(['embeddingId', 'discussionId', 'similarity'])
    .where('similarity', '>=', SIMILARITY_THRESHOLD)
    .orderBy('similarity', 'desc')
    .limit(MAX_CANDIDATES)
    .execute()
}

const makeSimilarDiscussionLink = async (
  similarDiscussion: SimilarDiscussion,
  dataLoader: DataLoaderWorker
) => {
  const {discussionId, similarity} = similarDiscussion
  const discussion = await dataLoader.get('discussions').loadNonNull(discussionId)
  const {meetingId, discussionTopicId: reflectionGroupId} = discussion
  const [meeting, reflectionGroup] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  ])

  if (!meeting || !isRetroMeeting(meeting)) return undefined
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
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data)
}

const generateRelatedDiscussions = async (meetingId: string, dataLoader: DataLoaderWorker) => {
  const [discussions, meeting] = await Promise.all([
    dataLoader.get('discussionsByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  const {phases} = meeting
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const orderedDiscussions = stages
    .map((stage) => discussions.find((d) => d.id === stage.discussionId))
    .filter(isValid)

  const r = await getRethink()
  return Promise.all(
    orderedDiscussions.map(async ({id: discussionId}) => {
      const similarDiscussions = await getSimilarDiscussions(discussionId, dataLoader)
      if (similarDiscussions.length === 0) return
      const rerankedDiscussions = await rerankSimilarDiscussions(
        discussionId,
        similarDiscussions,
        dataLoader
      )
      if (rerankedDiscussions.length === 0) return
      const topResults = rerankedDiscussions
        .filter((sd) => sd.similarity >= SIMILARITY_THRESHOLD)
        .sort((a, b) => (a.similarity < b.similarity ? -1 : 1))
        .slice(0, MAX_RESULTS)
      if (!topResults.length) return
      const links = (
        await Promise.all(
          topResults.map((sd) =>
            makeSimilarDiscussionLink(sd, dataLoader).then((link) => `<li>${link}</li>`)
          )
        )
      )
        .filter(isValid)
        .join('\n')
      const relatedDiscussionsComment = createAIComment(
        discussionId,
        buildCommentContentBlock('🤖 Related Discussions', `<ul>${links}</ul>`),
        2
      )
      await r.table('Comment').insert(relatedDiscussionsComment).run()
      publishComment(meetingId, relatedDiscussionsComment.id)
    })
  )
}

export default generateRelatedDiscussions
