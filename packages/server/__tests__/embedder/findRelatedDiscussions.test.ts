import {
  activeEmbeddingDefinition,
  activeEmbeddingModelId
} from '../../../embedder/activeEmbeddingModel'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import {getEmbeddingsTableName} from '../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../embedder/indexing/numberVectorToString'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {
  findRelatedDiscussions,
  getStepAfterEmbeddingTopic
} from '../../../embedder/workflows/findRelatedDiscussions'
import pickRelatedDiscussions from '../../../embedder/workflows/helpers/pickRelatedDiscussions'
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
jest.mock('../../../embedder/workflows/helpers/pickRelatedDiscussions', () => ({
  __esModule: true,
  default: jest.fn(async () => null)
}))

const HARRIER: ModelId = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const QWEN3: ModelId = 'Svenni551/Qwen3-Embedding-0.6B-ONNX-INT8'
const PROMPT =
  'Instruct: Given a topic from a team retrospective, retrieve past topics about the same issue\nQuery: '
const tableName = getEmbeddingsTableName(activeEmbeddingModelId)
const pg = getKysely()
const orgId = `relatedOrg${generateUID()}`
const teamId = `relatedTeam${generateUID()}`
const otherTeamId = `relatedTeam${generateUID()}`
const quietTeamId = `relatedTeam${generateUID()}`
const crowdedTeamId = `relatedTeam${generateUID()}`
const floorTeamId = `relatedTeam${generateUID()}`
const meetingId = `relatedMeeting${generateUID()}`
const pastMeetingId = `relatedMeeting${generateUID()}`
const otherTeamMeetingId = `relatedMeeting${generateUID()}`
const quietMeetingId = `relatedMeeting${generateUID()}`
const crowdedMeetingId = `relatedMeeting${generateUID()}`
const crowdedPastMeetingId = `relatedMeeting${generateUID()}`
const floorMeetingId = `relatedMeeting${generateUID()}`
const floorPastMeetingId = `relatedMeeting${generateUID()}`
const allTeamIds = [teamId, otherTeamId, quietTeamId, crowdedTeamId, floorTeamId]

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
  Array.from({length: activeEmbeddingDefinition!.embeddingDimensions}, (_, index) =>
    index === 0 ? cosine : index === 1 ? Math.sqrt(1 - cosine * cosine) : 0
  )

const mockEmbedder = {
  tableName,
  chunkText: jest.fn(async (text: string): Promise<string[] | Error> => [text]),
  getEmbedding: jest.fn(async (): Promise<number[] | Error> => vectorAt(1))
}

const insertTopic = async (fromTeamId: string, fromMeetingId: string, fullText: string | null) => {
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
    insertMeeting(quietMeetingId, quietTeamId),
    insertMeeting(crowdedMeetingId, crowdedTeamId),
    insertMeeting(crowdedPastMeetingId, crowdedTeamId),
    insertMeeting(floorMeetingId, floorTeamId),
    insertMeeting(floorPastMeetingId, floorTeamId)
  ])
})

beforeEach(() => {
  jest.mocked(publishSimilarRetroTopics).mockClear()
  jest.mocked(pickRelatedDiscussions).mockClear()
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

it('without AI, links past topics from the team over the cut-off, best first, at most 3', async () => {
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
})

it('lets the AI choose from the 10 closest past topics', async () => {
  const topic = await insertTopic(crowdedTeamId, crowdedMeetingId, 'Deploys break on Fridays')
  const pastTopics = await Promise.all(
    Array.from({length: 11}, (_, idx) =>
      insertTopic(crowdedTeamId, crowdedPastMeetingId, `Deploy trouble ${idx}`)
    )
  )
  await Promise.all(pastTopics.map((id, idx) => insertVector(id, 0.99 - idx / 50, null)))
  await run(topic)
  const [pickTeamId, pickTopic, candidates, maxPicks] =
    jest.mocked(pickRelatedDiscussions).mock.calls[0]!
  expect(pickTeamId).toBe(crowdedTeamId)
  expect(pickTopic).toBe('Deploys break on Fridays')
  expect(candidates.map(({embeddingsMetadataId}) => embeddingsMetadataId)).toEqual(
    pastTopics.slice(0, 10)
  )
  expect(maxPicks).toBe(3)
})

it('lets the AI judge topics under the cut-off, and shows only those over it without AI', async () => {
  const topic = await insertTopic(floorTeamId, floorMeetingId, 'Releases slip')
  const [overCutOff, underCutOff, nearFloor, belowFloor] = await Promise.all(
    ['Release train', 'Launch delays', 'Shipping dates', 'Office snacks'].map((text) =>
      insertTopic(floorTeamId, floorPastMeetingId, text)
    )
  )
  await Promise.all([
    insertVector(overCutOff!, 0.7, null),
    insertVector(underCutOff!, 0.6, null),
    insertVector(nearFloor!, 0.53, null),
    insertVector(belowFloor!, 0.5, null)
  ])
  await run(topic)
  const [, , candidates] = jest.mocked(pickRelatedDiscussions).mock.calls[0]!
  expect(candidates.map(({embeddingsMetadataId}) => embeddingsMetadataId)).toEqual([
    overCutOff,
    underCutOff,
    nearFloor
  ])
  const [, links] = jest.mocked(publishSimilarRetroTopics).mock.calls[0]!
  expect(links.map(({embeddingsMetadataId}) => embeddingsMetadataId)).toEqual([overCutOff])

  jest
    .mocked(pickRelatedDiscussions)
    .mockImplementationOnce(async (_teamId, _topic, aiCandidates) => [aiCandidates[2]!])
  await run(topic)
  const [, aiLinks] = jest.mocked(publishSimilarRetroTopics).mock.calls[1]!
  expect(aiLinks.map(({embeddingsMetadataId}) => embeddingsMetadataId)).toEqual([nearFloor])
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

it('searches with the first chunk of a long topic', async () => {
  const topic = await insertTopic(teamId, meetingId, 'A very long topic')
  mockEmbedder.chunkText.mockResolvedValueOnce(['The first chunk', 'The second chunk'])
  await run(topic)
  expect(mockEmbedder.getEmbedding).toHaveBeenCalledWith(`${PROMPT}The first chunk`)
})

it('does nothing for a topic whose text was never stored', async () => {
  const topic = await insertTopic(teamId, meetingId, null)
  expect(await run(topic)).toBe(false)
  expect(mockEmbedder.getEmbedding).not.toHaveBeenCalled()
  expect(publishSimilarRetroTopics).not.toHaveBeenCalled()
})

it('retries when the topic cannot be chunked', async () => {
  const topic = await insertTopic(teamId, meetingId, 'A topic')
  mockEmbedder.chunkText.mockResolvedValueOnce(new Error('TEI is down'))
  const result = await run(topic)
  expect(result).toBeInstanceOf(JobQueueError)
  expect((result as JobQueueError).retry).toBe(true)
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
