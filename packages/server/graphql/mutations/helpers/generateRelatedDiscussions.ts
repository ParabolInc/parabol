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
import {AbstractEmbeddingsModel} from '../../../../embedder/ai_models/abstractModel'

interface SimilarDiscussion {
  similarity: number
  newMeetingId: string
  discussionId: string
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
  const embeddingsModel = modelManager.getEmbeddingsModelsIter().next().value
  if (!embeddingsModel) return undefined
  const embeddingVector = await (embeddingsModel as AbstractEmbeddingsModel).getEmbeddings(
    embedText
  )
  const embeddingVectorStr = numberVectorToString(embeddingVector)
  const pg = getKysely()
  const embeddingsTable = embeddingsModel.getTableName()
  const query = await pg
    .with('CosineSimilarity', (pg) =>
      pg
        .selectFrom(embeddingsTable)
        .select([
          sql<number>`(1 - (${sql.id(embeddingsTable, 'embedding')} <=> ${embeddingVectorStr}))`.as(
            'similarity'
          ),
          sql<number>`${sql.id(embeddingsTable, 'embeddingsIndexId')}`.as('embeddingsIndexId'),
          'EmbeddingsIndex.refId as refId'
        ])
        .innerJoin('EmbeddingsIndex', `${embeddingsTable}.embeddingsIndexId`, 'EmbeddingsIndex.id')
        .where('EmbeddingsIndex.objectType', '=', 'retrospectiveDiscussionTopic')
        .where('EmbeddingsIndex.state', '=', 'embedded')
        .where('EmbeddingsIndex.teamId', '=', team.id)
        .where('EmbeddingsIndex.orgId', '=', team.orgId)
    )
    .selectFrom('CosineSimilarity')
    .select(['refId', 'similarity'])
    .where('similarity', '>', 0.8)
    .orderBy('similarity', 'desc')
    .limit(3)
    .execute()

  const results = query
    .map((r) => {
      const similarity = r.similarity
      const [newMeetingId, discussionId] = r.refId?.split(':') || [undefined, undefined]
      if (!similarity || !newMeetingId || !discussionId) return undefined
      else
        return {
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
  const discussPhaseStage = (discussPhase as DiscussPhase)?.stages.find(
    (stage) => stage.id === similarDiscussion.discussionId
  )
  const stageSortOrder = discussPhaseStage?.sortOrder
  if (typeof stageSortOrder === 'undefined') return undefined
  const reflectionGroupId = discussPhaseStage?.reflectionGroupId
  if (!reflectionGroupId) return undefined
  const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  const meetingName = meeting.name ? meeting.name : 'Past retrospective'
  const topic = reflectionGroup?.title ? reflectionGroup.title : 'topic'

  const url = makeAppURL(appOrigin, `meet/${meeting.id}/discuss/${stageSortOrder + 1}`)

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
    const links = (
      await Promise.all(
        similarDiscussions.map((similarDiscussion) =>
          makeSimilarDiscussionLink(similarDiscussion, dataLoader).then(
            (link) => `<li>${link}</li>`
          )
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
