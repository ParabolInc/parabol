import type {Transaction} from 'kysely'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import type {DB} from '../../postgres/types/pg'

const pg = getKysely()
const modelId: ModelId = 'microsoft/harrier-oss-v1-270m'
const userId = `fillOrderTest|${generateUID()}`
const teamId = `fillOrderTeam${generateUID()}`
const DAY_MS = 86_400_000
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS)
const LONG_TEXT = 'Words people wrote on this page. '.repeat(10)

class Rollback extends Error {}

type MetadataSeed = {
  objectType: 'meetingTemplate' | 'retrospectiveDiscussionTopic' | 'retroReflection'
  teamId: string
  days: number
  language?: 'en' | null
}

const insertMetadata = async (trx: Transaction<DB>, seed: MetadataSeed) => {
  const {id} = await trx
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType: seed.objectType,
      refId: generateUID(),
      teamId: seed.teamId,
      refUpdatedAt: daysAgo(seed.days),
      language: seed.language === undefined ? 'en' : seed.language
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const insertPage = async (
  trx: Transaction<DB>,
  sortOrder: string,
  {days, text = LONG_TEXT, deleted = false}: {days: number; text?: string; deleted?: boolean}
) => {
  const {id} = await trx
    .insertInto('Page')
    .values({
      userId,
      sortOrder,
      title: 'Fill order test',
      plaintextContent: text,
      updatedAt: daysAgo(days),
      deletedAt: deleted ? new Date() : null
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const fillJobs = async (trx: Transaction<DB>) => {
  await new TextEmbeddingsInference(
    modelId,
    'http://localhost:3040/',
    1024
  ).createEmbeddingsForModel(trx)
  return trx
    .selectFrom('EmbeddingsJobQueueV2')
    .select(['embeddingsMetadataId', 'pageId', 'priority', 'jobData', 'jobType'])
    .where('modelId', '=', modelId)
    .execute()
}

const withRollback = async (run: (trx: Transaction<DB>) => Promise<void>) => {
  await expect(
    pg.transaction().execute(async (trx) => {
      await trx
        .insertInto('User')
        .values({
          id: userId,
          email: `${userId}@example.com`,
          picture: 'https://example.com/pic.png',
          preferredName: 'Fill Order Tester'
        })
        .execute()
      await run(trx)
      throw new Rollback()
    })
  ).rejects.toBeInstanceOf(Rollback)
}

afterAll(async () => {
  await pg.destroy()
})

it('queues public templates, team templates, discussions, then pages, newest first', async () => {
  await withRollback(async (trx) => {
    const publicTemplate = await insertMetadata(trx, {
      objectType: 'meetingTemplate',
      teamId: 'aGhostTeam',
      days: 900
    })
    const teamTemplate = await insertMetadata(trx, {objectType: 'meetingTemplate', teamId, days: 2})
    const newDiscussion = await insertMetadata(trx, {
      objectType: 'retrospectiveDiscussionTopic',
      teamId,
      days: 3
    })
    const oldDiscussion = await insertMetadata(trx, {
      objectType: 'retrospectiveDiscussionTopic',
      teamId,
      days: 300
    })
    const newPage = await insertPage(trx, 'a0', {days: 1})
    const oldPage = await insertPage(trx, 'a1', {days: 200})

    const jobs = await fillJobs(trx)
    const priorityOf = (id: number, column: 'embeddingsMetadataId' | 'pageId') =>
      jobs.find((job) => job[column] === id)!.priority
    const order = [
      priorityOf(publicTemplate, 'embeddingsMetadataId'),
      priorityOf(teamTemplate, 'embeddingsMetadataId'),
      priorityOf(newDiscussion, 'embeddingsMetadataId'),
      priorityOf(oldDiscussion, 'embeddingsMetadataId'),
      priorityOf(newPage, 'pageId'),
      priorityOf(oldPage, 'pageId')
    ]
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(new Set(order).size).toBe(order.length)
  })
})

it('puts reflections from retros still under way with the public templates', async () => {
  await withRollback(async (trx) => {
    const publicTemplate = await insertMetadata(trx, {
      objectType: 'meetingTemplate',
      teamId: 'aGhostTeam',
      days: 900
    })
    const teamTemplate = await insertMetadata(trx, {objectType: 'meetingTemplate', teamId, days: 2})
    const liveReflection = await insertMetadata(trx, {
      objectType: 'retroReflection',
      teamId,
      days: 0
    })
    const jobs = await fillJobs(trx)
    const priorityOf = (id: number) =>
      jobs.find(({embeddingsMetadataId}) => embeddingsMetadataId === id)!.priority
    expect(priorityOf(liveReflection)).toBe(priorityOf(publicTemplate))
    expect(priorityOf(liveReflection)).toBeLessThan(priorityOf(teamTemplate))
  })
})

it('leaves out what nothing reads', async () => {
  await withRollback(async (trx) => {
    const oldReflection = await insertMetadata(trx, {
      objectType: 'retroReflection',
      teamId,
      days: 30
    })
    const oldDiscussion = await insertMetadata(trx, {
      objectType: 'retrospectiveDiscussionTopic',
      teamId,
      days: 500
    })
    const unsupported = await insertMetadata(trx, {
      objectType: 'retrospectiveDiscussionTopic',
      teamId,
      days: 3,
      language: null
    })
    const trashedPage = await insertPage(trx, 'a0', {days: 1, deleted: true})
    const nearlyEmptyPage = await insertPage(trx, 'a1', {days: 1, text: 'Too short'})
    const jobs = await fillJobs(trx)
    const metadataIds = jobs.map(({embeddingsMetadataId}) => embeddingsMetadataId)
    const pageIds = jobs.map(({pageId}) => pageId)
    expect(metadataIds).not.toContain(oldReflection)
    expect(metadataIds).not.toContain(oldDiscussion)
    expect(metadataIds).not.toContain(unsupported)
    expect(pageIds).not.toContain(trashedPage)
    expect(pageIds).not.toContain(nearlyEmptyPage)
  })
})

it('rebuilds metadata text and stays behind live work', async () => {
  await withRollback(async (trx) => {
    const template = await insertMetadata(trx, {objectType: 'meetingTemplate', teamId, days: 2})
    const page = await insertPage(trx, 'a0', {days: 1})
    const jobs = await fillJobs(trx)
    const templateJob = jobs.find(({embeddingsMetadataId}) => embeddingsMetadataId === template)!
    const pageJob = jobs.find(({pageId}) => pageId === page)!
    expect(templateJob.jobType).toBe('embed:start')
    expect(templateJob.jobData).toEqual({forceBuildText: true})
    expect(pageJob.jobType).toBe('embedPage:start')
    const HISTORICAL_BAND_TOP = 500_000_000
    expect(templateJob.priority).toBeGreaterThan(HISTORICAL_BAND_TOP)
    expect(pageJob.priority).toBeGreaterThan(templateJob.priority)
  })
})
