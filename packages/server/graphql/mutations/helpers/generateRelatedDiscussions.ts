import {sql} from 'kysely'

import getKysely from '../../../postgres/getKysely'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'
import {Team} from '../../../postgres/queries/getTeamsByIds'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {isRetroMeeting} from '../../meetingTypePredicates'
import DiscussPhase from '../../../database/types/DiscussPhase'
import {createAIComment, buildCommentContentBlock} from './addAIGeneratedContentToThreads'
import appOrigin from '../../../appOrigin'
import makeAppURL from '../../../../client/utils/makeAppURL'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from '../../../../client/types/constEnums'

import {createTextFromNewMeetingDiscussion} from '../../../../embedder/indexing/retrospectiveDiscussionTopic'
import getModelManager from '../../../../embedder/ai_models/ModelManager'
import numberVectorToString from '../../../../embedder/indexing/numberVectorToString'
import {AbstractEmbeddingsModel} from '../../../../embedder/ai_models/AbstractModel'

const MAX_CANDIDATES = 10
const MAX_RESULTS = 3
const SIMILARITY_THRESHOLD = 0.67
const RERANK_THRESHOLD = 0.7
const RERANK_MULTIPLE = 3

/*
 * An overview on how this works:
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
  modelId: string
  similarity: number
  newMeetingId: string
  discussionId: string
}

const rerankSimilarDiscussions = async (
  meeting: MeetingRetrospective,
  discussionStageId: string,
  similarDiscussions: SimilarDiscussion[],
  dataLoader: DataLoaderWorker
): Promise<SimilarDiscussion[] | undefined> => {
  const embedText = await createTextFromNewMeetingDiscussion(
    meeting,
    discussionStageId,
    dataLoader,
    true // only return reflection & discussion content
  )
  const embeddingsModel = getModelManager()?.getFirstEmbedder()
  if (!embeddingsModel) return undefined
  const embeddingVector = await (embeddingsModel as AbstractEmbeddingsModel).getEmbedding(embedText)
  const embeddingVectorStr = numberVectorToString(embeddingVector)
  const rerankIds = similarDiscussions.map((sd) => sd.modelId)
  const pg = getKysely()
  const embeddingsTable = embeddingsModel.getTableName()
  const query = await pg
    .selectFrom(embeddingsTable as any)
    .select([
      sql`${sql.id(embeddingsTable, 'id')}`.as('modelId'),
      sql<number>`(1 - (${sql.id(embeddingsTable, 'embedding')} <=> ${embeddingVectorStr}))`.as(
        'similarity'
      )
    ])
    .where('id', 'in', rerankIds)
    .execute()

  // console.log(`SD INPUTS: ${JSON.stringify(similarDiscussions)}`)
  // console.log(`RERANK QUERY: ${JSON.stringify(query)}`)

  const results = query.map((r) => {
    const modelId: string = r.modelId as unknown as string
    const similarDiscussion = similarDiscussions.find((sd) => sd.modelId === modelId)
    const similarity = Math.min(
      0.999999999, // Limit the upper bound to 0.999..
      Math.max(
        -0.999999999, // Limit the lower bound to -0.999..
        similarDiscussion!.similarity + (r.similarity - RERANK_THRESHOLD) * RERANK_MULTIPLE
      )
    )
    const [newMeetingId, discussionId] = [
      similarDiscussion!.newMeetingId,
      similarDiscussion!.discussionId
    ]
    return {
      modelId,
      similarity,
      newMeetingId,
      discussionId
    }
  })

  // console.log(`RERANK RESULTS: ${JSON.stringify(results)}`)

  return results
}

const getSimilarDiscussions = async (
  meeting: MeetingRetrospective,
  discussionStageId: string,
  team: Team,
  dataLoader: DataLoaderWorker
): Promise<SimilarDiscussion[] | undefined> => {
  const embedText = await createTextFromNewMeetingDiscussion(meeting, discussionStageId, dataLoader)
  const modelManager = getModelManager()
  if (!modelManager) return undefined

  // for this demo, we're just going to use the highest priority embedding model:
  const embeddingsModel = getModelManager()?.getFirstEmbedder()
  if (!embeddingsModel) return undefined
  const embeddingVector = await (embeddingsModel as AbstractEmbeddingsModel).getEmbedding(embedText)
  const embeddingVectorStr = numberVectorToString(embeddingVector)
  const pg = getKysely()
  const embeddingsTable = embeddingsModel.getTableName()
  const query = await pg
    .with('CosineSimilarity', (pg) =>
      pg
        .selectFrom(embeddingsTable as any)
        .select([
          sql`${sql.id(embeddingsTable, 'id')}`.as('modelId'),
          sql<number>`(1 - (${sql.id(embeddingsTable, 'embedding')} <=> ${embeddingVectorStr}))`.as(
            'similarity'
          ),
          sql<number>`${sql.id(embeddingsTable, 'embeddingsMetadataId')}`.as(
            'embeddingsMetadataId'
          ),
          'EmbeddingsMetadata.refId as refId'
        ])
        .innerJoin(
          'EmbeddingsMetadata',
          `${embeddingsTable}.embeddingsMetadataId`,
          'EmbeddingsMetadata.id'
        )
        .where('EmbeddingsMetadata.objectType', '=', 'retrospectiveDiscussionTopic')
        .where('EmbeddingsMetadata.models', '@>', sql`ARRAY[${embeddingsTable}]` as any)
        .where('EmbeddingsMetadata.teamId', '=', team.id)
    )
    .selectFrom('CosineSimilarity')
    .select(['modelId', 'refId', 'similarity'])
    .where('similarity', '>=', SIMILARITY_THRESHOLD)
    .orderBy('similarity', 'desc')
    .limit(MAX_CANDIDATES)
    .execute()

  const results = query
    .map((r) => {
      const modelId = r.modelId
      const similarity = r.similarity
      const [newMeetingId, discussionId] = r.refId?.split(':') || [undefined, undefined]
      if (!similarity || !newMeetingId || !discussionId) return undefined
      else
        return {
          modelId,
          similarity,
          newMeetingId,
          discussionId
        }
    })
    .filter((r): r is SimilarDiscussion => !(typeof r === 'undefined'))

  return results.length > 0 ? results : undefined
}

const makeSimilarDiscussionLink = async (
  similarDiscussion: SimilarDiscussion,
  dataLoader: DataLoaderWorker
) => {
  const meeting = await dataLoader.get('newMeetings').load(similarDiscussion.newMeetingId)
  if (!meeting || !isRetroMeeting(meeting)) return undefined
  const discussPhase = meeting.phases?.find((phase) => phase.phaseType === 'discuss')
  const discussStages = (discussPhase as DiscussPhase)?.stages
  const discussPhaseStage = discussStages.find(
    (stage) => stage.id === similarDiscussion.discussionId
  )
  const stageSortOrder = discussPhaseStage?.sortOrder
  if (typeof stageSortOrder === 'undefined') return undefined
  const reflectionGroupId = discussPhaseStage?.reflectionGroupId
  if (!reflectionGroupId) return undefined
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  const meetingName = meeting.name ? meeting.name : 'Past retrospective'
  const topic = reflectionGroup?.title ? reflectionGroup.title : 'topic'

  const stageIndex = discussStages
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .findIndex((stage) => stage.id === similarDiscussion.discussionId)

  const url = makeAppURL(appOrigin, `meet/${meeting.id}/discuss/${stageIndex + 1}`)

  return (
    `<a href="${url}">` +
    `${meetingName} – ${topic} (score: ${Math.trunc(100 * similarDiscussion.similarity)})` +
    `</a>`
  )
}

const publishComment = async (meetingId: string, commentId: string) => {
  const data = {commentId, meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AddCommentSuccess', data)
}

const generateRelatedDiscussions = async (
  meeting: MeetingRetrospective,
  teamId: string,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const discussPhase = meeting.phases.find((phase) => phase.phaseType === 'discuss')
  const discussPhaseStages = (discussPhase as DiscussPhase)?.stages || []
  const r = await getRethink()
  const commentPromises = discussPhaseStages.map(async ({id: stageId, discussionId}) => {
    const similarDiscussions = await getSimilarDiscussions(meeting, stageId, team, dataLoader)
    if (!similarDiscussions) return
    const rerankedDiscussions = await rerankSimilarDiscussions(
      meeting,
      stageId,
      similarDiscussions,
      dataLoader
    )
    if (!rerankedDiscussions) return
    const topResults = rerankedDiscussions
      .filter((sd) => sd.similarity >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS)
    if (!topResults.length) return
    const links = (
      await Promise.all(
        topResults.map((sd) =>
          makeSimilarDiscussionLink(sd, dataLoader).then((link) => `<li>${link}</li>`)
        )
      )
    )
      .filter((link) => typeof link !== 'undefined')
      .join('\n')
    const relatedDiscussionsComment = createAIComment(
      discussionId,
      buildCommentContentBlock('🤖 Related Discussions', `<ul>${links}</ul>`),
      2
    )
    return r
      .table('Comment')
      .insert(relatedDiscussionsComment)
      .run()
      .then((_) => publishComment(meeting.id, relatedDiscussionsComment.id))
  })
  Promise.all(commentPromises) // DON'T WAIT
}

export default generateRelatedDiscussions
