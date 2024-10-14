import isValid from 'parabol-server/graphql/isValid'
import getKysely from 'parabol-server/postgres/getKysely'
import getPhase from 'parabol-server/utils/getPhase'
import {MessageToEmbedderRelatedDiscussions} from '../../server/graphql/mutations/helpers/publishToEmbedder'
import getModelManager from '../ai_models/ModelManager'
import {JobQueueStepRun, ParentJob} from '../custom'
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
    dataLoader.get('newMeetings').loadNonNull(meetingId)
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
  if (metadataRows.length === 0) return false
  const inserts = await pg
    .insertInto('EmbeddingsMetadata')
    .values(metadataRows)
    .onConflict((oc) =>
      // trigger an update in order to return the ID of the existing row
      oc.columns(['refId', 'objectType']).doUpdateSet((eb) => ({
        objectType: eb.ref('excluded.objectType')
      }))
    )
    .returning('id')
    .execute()

  const modelManager = getModelManager()
  // Only get 1 embedder since we only want to publish 1 message to the user
  const {tableName} = modelManager.getEmbedder()

  return inserts.map(({id}) => ({
    embeddingsMetadataId: id,
    model: tableName
  }))
}
