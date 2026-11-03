import {sql, type Transaction} from 'kysely'
import type {ModelId} from '../../../embedder/ai_models/modelIdDefinitions'
import TextEmbeddingsInference from '../../../embedder/ai_models/TextEmbeddingsInference'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import type {DB} from '../../postgres/types/pg'

const mockPublish = jest.fn(async () => 0)
jest.mock('../../utils/getRedis', () => ({
  __esModule: true,
  default: () => ({publish: mockPublish})
}))

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
  // The fill reads every row, so a parallel suite deleting one mid-statement would break its foreign key
  await sql`LOCK TABLE "EmbeddingsMetadata" IN SHARE MODE`.execute(trx)
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
  await pg
    .transaction()
    .execute(async (trx) => {
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
    .catch((error) => {
      if (!(error instanceof Rollback)) throw error
    })
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

it('puts the last two weeks of reflections with the public templates', async () => {
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
      days: 10
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
    const nearlyEmptyPage = await insertPage(trx, 'a1', {days: 1, text: 'Too short'})
    const jobs = await fillJobs(trx)
    const metadataIds = jobs.map(({embeddingsMetadataId}) => embeddingsMetadataId)
    const pageIds = jobs.map(({pageId}) => pageId)
    expect(metadataIds).not.toContain(oldReflection)
    expect(metadataIds).not.toContain(oldDiscussion)
    expect(metadataIds).not.toContain(unsupported)
    expect(pageIds).not.toContain(nearlyEmptyPage)
  })
})

it('queues a trashed page, since restoring it queues nothing', async () => {
  await withRollback(async (trx) => {
    const trashedPage = await insertPage(trx, 'a0', {days: 1, deleted: true})
    const jobs = await fillJobs(trx)
    expect(jobs.map(({pageId}) => pageId)).toContain(trashedPage)
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

describe('creating the tables', () => {
  const makeModel = (name: string) => {
    const model = Object.assign(new TextEmbeddingsInference(modelId, 'http://localhost:1/', 1024), {
      tableName: `Embeddings_${name}`,
      pagesTableName: `EmbeddingsPages_${name}`
    })
    const steps: string[] = []
    const fill = jest.spyOn(model, 'createEmbeddingsForModel').mockImplementation(async () => {
      steps.push('fill')
    })
    const createTables = jest.spyOn(model, 'createVectorTables').mockImplementation(async () => {
      steps.push('tables')
    })
    return {model, steps, fill, createTables}
  }

  it('queues the fill first, so foreign key locks are only held at the end', async () => {
    const {model, steps} = makeModel('fillOrder')
    await model.createTable()
    expect(steps).toEqual(['fill', 'tables'])
  })

  it('does both in one transaction, so a failure leaves nothing for the next start to skip', async () => {
    const {model, fill, createTables} = makeModel('fillInOneTransaction')
    await model.createTable()
    const fillDb = fill.mock.calls[0]![0]
    expect(fillDb?.isTransaction).toBe(true)
    expect(createTables.mock.calls[0]![0]).toBe(fillDb)
  })

  it('creates no tables when the fill fails', async () => {
    const {model, fill, createTables} = makeModel('fillThatFails')
    fill.mockRejectedValue(new Error('pod died'))
    await expect(model.createTable()).rejects.toThrow('pod died')
    expect(createTables).not.toHaveBeenCalled()
  })

  it('wakes idle workers when the fill commits', async () => {
    const {model} = makeModel('fillPublishes')
    mockPublish.mockClear()
    await model.createTable()
    expect(mockPublish).toHaveBeenCalledWith('embeddingsJobAdded', '')
  })

  it('wakes nobody when the fill fails', async () => {
    const {model, fill} = makeModel('fillThatFailsQuietly')
    fill.mockRejectedValue(new Error('pod died'))
    mockPublish.mockClear()
    await expect(model.createTable()).rejects.toThrow('pod died')
    expect(mockPublish).not.toHaveBeenCalled()
  })
})
