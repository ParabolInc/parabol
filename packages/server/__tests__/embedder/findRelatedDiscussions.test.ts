import {activeEmbeddingModelId} from '../../../embedder/activeEmbeddingModel'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import {getEmbeddingsTableName} from '../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../embedder/indexing/numberVectorToString'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {
  findRelatedDiscussions,
  getStepAfterEmbeddingTopic
} from '../../../embedder/workflows/findRelatedDiscussions'
import {publishSimilarRetroTopics} from '../../../embedder/workflows/helpers/publishSimilarRetroTopics'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'

jest.mock('../../../embedder/ai_models/ModelManager', () => ({
  __esModule: true,
  default: () => ({getEmbedder: () => mockEmbedder})
}))
jest.mock('../../../embedder/workflows/helpers/publishSimilarRetroTopics', () => ({
  publishSimilarRetroTopics: jest.fn(async () => undefined)
}))

const HARRIER: ModelId = 'microsoft/harrier-oss-v1-270m'
const QWEN3: ModelId = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const PROMPT =
  'Instruct: Given a topic from a team retrospective, retrieve past topics about the same issue\nQuery: '
const tableName = getEmbeddingsTableName(activeEmbeddingModelId)
const pg = getKysely()
const orgId = `relatedOrg${generateUID()}`
const teamId = `relatedTeam${generateUID()}`
const otherTeamId = `relatedTeam${generateUID()}`
const quietTeamId = `relatedTeam${generateUID()}`
const meetingId = `relatedMeeting${generateUID()}`
const pastMeetingId = `relatedMeeting${generateUID()}`
const otherTeamMeetingId = `relatedMeeting${generateUID()}`
const quietMeetingId = `relatedMeeting${generateUID()}`
const allTeamIds = [teamId, otherTeamId, quietTeamId]

const insertMeeting = (id: string, meetingTeamId: string) =>
  pg
    .insertInto('NewMeeting')
    .values({
      id,
      teamId: meetingTeamId,
      facilitatorStageId: 'stage1',
      meetingType: 'retrospective',
      name: 'Related discussions test',
      meetingCount: 1,
      meetingNumber: 1,
      phases: JSON.stringify([])
    })
    .execute()

const vectorAt = (cosine: number) =>
  Array.from({length: 1024}, (_, index) =>
    index === 0 ? cosine : index === 1 ? Math.sqrt(1 - cosine * cosine) : 0
  )

const mockEmbedder = {
  tableName,
  getEmbedding: jest.fn(async (): Promise<number[] | Error> => vectorAt(1))
}

const insertTopic = async (fromTeamId: string, fromMeetingId: string, fullText: string) => {
  const discussionId = generateUID()
  await pg
    .insertInto('Discussion')
    .values({
      id: discussionId,
      teamId: fromTeamId,
      meetingId: fromMeetingId,
      discussionTopicId: generateUID(),
      discussionTopicType: 'reflectionGroup'
    })
    .execute()
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType: 'retrospectiveDiscussionTopic',
      refId: discussionId,
      teamId: fromTeamId,
      language: 'en',
      fullText
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const insertVector = (embeddingsMetadataId: number, cosine: number, chunkNumber: number | null) =>
  pg
    .insertInto(tableName)
    .values({
      embeddingsMetadataId,
      embedding: numberVectorToString(vectorAt(cosine)),
      chunkNumber,
      tsv: ''
    })
    .execute()

const run = (embeddingsMetadataId: number) =>
  findRelatedDiscussions({
    dataLoader: getNewDataLoader('findRelatedDiscussionsTest'),
    data: {embeddingsMetadataId, modelId: HARRIER}
  })

beforeAll(async () => {
  await pg
    .insertInto('Organization')
    .values({id: orgId, name: 'Related org', tier: 'team'})
    .execute()
  await pg
    .insertInto('Team')
    .values(allTeamIds.map((id) => ({id, name: 'Related team', orgId})))
    .execute()
  await Promise.all([
    insertMeeting(meetingId, teamId),
    insertMeeting(pastMeetingId, teamId),
    insertMeeting(otherTeamMeetingId, otherTeamId),
    insertMeeting(quietMeetingId, quietTeamId)
  ])
})

beforeEach(() => {
  jest.mocked(publishSimilarRetroTopics).mockClear()
  mockEmbedder.getEmbedding.mockClear()
})

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsMetadata').where('teamId', 'in', allTeamIds).execute()
  await pg.deleteFrom('Discussion').where('teamId', 'in', allTeamIds).execute()
  await pg.deleteFrom('NewMeeting').where('teamId', 'in', allTeamIds).execute()
  await pg.deleteFrom('Team').where('id', 'in', allTeamIds).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.destroy()
})

it('embeds the topic with the same-issue prompt', async () => {
  const topic = await insertTopic(teamId, meetingId, 'Flaky deploys\nCI keeps failing')
  await run(topic)
  expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith(`${PROMPT}Flaky deploys\nCI keeps failing`)
})

it('links past topics from the team over the cut-off, best first, at most 3', async () => {
  const topic = await insertTopic(teamId, meetingId, 'Reviews sit for days')
  const best = await insertTopic(teamId, pastMeetingId, 'PRs wait on approval')
  const second = await insertTopic(teamId, pastMeetingId, 'Slow code review')
  const third = await insertTopic(teamId, pastMeetingId, 'Nobody reviews on time')
  const fourth = await insertTopic(teamId, pastMeetingId, 'Review queue')
  const belowCutOff = await insertTopic(teamId, pastMeetingId, 'Office snacks')
  await Promise.all([
    insertVector(best, 0.95, null),
    insertVector(second, 0.9, null),
    insertVector(third, 0.85, null),
    insertVector(fourth, 0.8, null),
    insertVector(belowCutOff, 0.61, null)
  ])
  expect(await run(topic)).toBe(false)
  const [, links] = jest.mocked(publishSimilarRetroTopics).mock.calls[0]!
  expect(links.map(({embeddingsMetadataId}) => embeddingsMetadataId)).toEqual([best, second, third])
  expect(links[0]!.similarity).toBeCloseTo(0.95, 2)
})

it('scores a long past topic by its best chunk, once', async () => {
  const topic = await insertTopic(teamId, meetingId, 'Long topic')
  const longTopic = await insertTopic(teamId, pastMeetingId, 'A long past topic')
  await Promise.all([insertVector(longTopic, 0.99, 0), insertVector(longTopic, 0.7, 1)])
  await run(topic)
  const [, links] = jest.mocked(publishSimilarRetroTopics).mock.calls[0]!
  expect(links.filter(({embeddingsMetadataId}) => embeddingsMetadataId === longTopic)).toEqual([
    {embeddingsMetadataId: longTopic, similarity: expect.closeTo(0.99, 2)}
  ])
})

it('ignores its own meeting and other teams', async () => {
  const topic = await insertTopic(quietTeamId, quietMeetingId, 'Quiet team topic')
  const sameMeeting = await insertTopic(quietTeamId, quietMeetingId, 'Another topic in this retro')
  const otherTeam = await insertTopic(otherTeamId, otherTeamMeetingId, 'Another team')
  await Promise.all([insertVector(sameMeeting, 0.99, null), insertVector(otherTeam, 0.99, null)])
  expect(await run(topic)).toBe(false)
  const [, links] = jest.mocked(publishSimilarRetroTopics).mock.calls[0]!
  expect(links).toEqual([])
})

it('retries when the embedding fails', async () => {
  const topic = await insertTopic(teamId, meetingId, 'A topic')
  mockEmbedder.getEmbedding.mockResolvedValueOnce(new Error('TEI is down'))
  const result = await run(topic)
  expect(result).toBeInstanceOf(JobQueueError)
  expect((result as JobQueueError).retry).toBe(true)
  expect(publishSimilarRetroTopics).not.toHaveBeenCalled()
})

it('goes straight to related topics on a model with a prompt, and through rerank without one', () => {
  expect(getStepAfterEmbeddingTopic(HARRIER)).toBe('findRelatedDiscussions')
  expect(getStepAfterEmbeddingTopic(QWEN3)).toBe('getSimilarRetroTopics')
})

it('posts no comment when nothing is related', async () => {
  const {publishSimilarRetroTopics: realPublish} = jest.requireActual<
    typeof import('../../../embedder/workflows/helpers/publishSimilarRetroTopics')
  >('../../../embedder/workflows/helpers/publishSimilarRetroTopics')
  const dataLoader = getNewDataLoader('findRelatedDiscussionsTest')
  const missingMetadataId = -1
  await expect(realPublish(missingMetadataId, [], dataLoader)).resolves.toBeUndefined()
  dataLoader.dispose()
})
