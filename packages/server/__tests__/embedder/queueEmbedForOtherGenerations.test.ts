import {queueEmbedForOtherGenerations} from '../../../embedder/queueEmbedForOtherGenerations'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/activeEmbeddingModel', () => ({
  activeEmbeddingModelId: 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8',
  embeddingModelIds: ['Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8', 'otherGenerationsShadow']
}))

const pg = getKysely()
const refId = `otherGenerationsTest-${generateUID()}`

afterAll(async () => {
  await pg
    .deleteFrom('EmbeddingsJobQueueV2')
    .where('modelId', '=', 'otherGenerationsShadow')
    .execute()
  await pg.deleteFrom('EmbeddingsMetadata').where('refId', '=', refId).execute()
  await pg.destroy()
})

it('queues new metadata for the generations that are not active', async () => {
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({objectType: 'retrospectiveDiscussionTopic', refId, teamId: 'team'})
    .returning('id')
    .executeTakeFirstOrThrow()
  await queueEmbedForOtherGenerations([id])
  const queued = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['jobType', 'modelId'])
    .where('embeddingsMetadataId', '=', id)
    .execute()
  expect(queued).toEqual([{jobType: 'embed:start', modelId: 'otherGenerationsShadow'}])
})
