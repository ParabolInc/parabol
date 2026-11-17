import {FIRST_FILL_PRIORITY} from '../../../embedder/getEmbedderJobPriority'
import generateUID from '../../generateUID'
import type {DataLoaderWorker} from '../../graphql/graphql'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/getEmbedderJobPriority', () => {
  const actual = jest.requireActual('../../../embedder/getEmbedderJobPriority')
  return {...actual, getEmbedderJobPriority: async () => actual.FIRST_FILL_PRIORITY + 1}
})

const HARRIER = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const QWEN3 = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const pg = getKysely()
const meetingId = `relatedStartMeeting${generateUID()}`
const discussionId = `relatedStartDiscussion${generateUID()}`
const teamId = `relatedStartTeam${generateUID()}`

const loadRelatedDiscussionsStart = () => {
  jest.resetModules()
  process.env.AI_EMBEDDING_MODELS = JSON.stringify(
    [HARRIER, QWEN3].map((modelId, idx) => ({
      model: `text-embeddings-inference:${modelId}`,
      url: `http://localhost:${3041 - idx}/`,
      maxTokens: 1024
    }))
  )
  return (
    require('../../../embedder/workflows/relatedDiscussionsStart') as typeof import('../../../embedder/workflows/relatedDiscussionsStart')
  ).relatedDiscussionsStart
}

const dataLoader = {
  get: (name: string) => ({
    load: async () =>
      name === 'discussionsByMeetingId'
        ? [{id: discussionId, teamId, createdAt: new Date()}]
        : null,
    loadNonNull: async () => ({phases: [{phaseType: 'discuss', stages: [{discussionId}]}]})
  })
} as unknown as DataLoaderWorker

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsMetadata').where('refId', '=', discussionId).execute()
  await pg.destroy()
})

it('finds related discussions with the active model and embeds the topic for the others', async () => {
  const relatedDiscussionsStart = loadRelatedDiscussionsStart()
  const result = await relatedDiscussionsStart({data: {meetingId}, dataLoader})
  const {id: embeddingsMetadataId} = await pg
    .selectFrom('EmbeddingsMetadata')
    .select('id')
    .where('refId', '=', discussionId)
    .executeTakeFirstOrThrow()
  expect(result).toEqual([{embeddingsMetadataId, modelId: HARRIER}])
  const jobs = await pg
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['modelId', 'jobType', 'jobData', 'priority'])
    .where('embeddingsMetadataId', '=', embeddingsMetadataId)
    .execute()
  expect(jobs).toEqual([
    {
      modelId: QWEN3,
      jobType: 'embed:start',
      jobData: {forceBuildText: true},
      priority: FIRST_FILL_PRIORITY + 1
    }
  ])
})
