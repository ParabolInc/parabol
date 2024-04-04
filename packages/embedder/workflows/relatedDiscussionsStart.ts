import isValid from 'parabol-server/graphql/isValid'
import getKysely from 'parabol-server/postgres/getKysely'
import getPhase from 'parabol-server/utils/getPhase'
import getModelManager from '../ai_models/ModelManager'
import {JobQueueStepRun, MessageToEmbedderRelatedDiscussions, ParentJob} from '../custom'
import {embedMetadata} from './embedMetadata'

export const relatedDiscussionsStart: JobQueueStepRun<
  MessageToEmbedderRelatedDiscussions['data'],
  ParentJob<typeof embedMetadata>
> = async (context) => {
  const pg = getKysely()
  const {data, dataLoader} = context
  const {meetingId} = data
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

  const metadataRows = orderedDiscussions.map(({id, teamId, createdAt}) => ({
    refId: id,
    objectType: 'retrospectiveDiscussionTopic' as const,
    teamId,
    // Not techincally updatedAt since discussions are updated after they get created
    refUpdatedAt: createdAt
  }))
  const inserts = await pg
    .insertInto('EmbeddingsMetadata')
    .values(metadataRows)
    .onConflict((oc) => oc.doNothing())
    .returning('id')
    .execute()

  const modelManager = getModelManager()
  const models = [...modelManager.embeddingModels.keys()]
  return models.flatMap((model) =>
    inserts.map(({id}) => ({
      embeddingsMetadataId: id,
      model: model
    }))
  )
}
