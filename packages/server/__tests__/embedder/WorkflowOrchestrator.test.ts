import {FIRST_FILL_PRIORITY} from '../../../embedder/getEmbedderJobPriority'
import {JobQueueError} from '../../../embedder/JobQueueError'
import {WorkflowOrchestrator} from '../../../embedder/WorkflowOrchestrator'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import type {EmbeddingsJobQueueV2} from '../../postgres/types'

const modelId = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const mockModel = {isReady: true, ready: jest.fn(async () => true)}

jest.mock('../../../embedder/ai_models/ModelManager', () => ({
  __esModule: true,
  default: () => ({getEmbedder: () => mockModel})
}))

jest.mock('parabol-client/utils/sleep', () => ({__esModule: true, default: async () => {}}))

const pg = getKysely()
const orchestrator = new WorkflowOrchestrator()
const run = jest.fn()
orchestrator.workflows.embedPage = {start: {run}}

const insertRunningJob = async (priority: number, jobModelId: string = modelId) =>
  (await pg
    .insertInto('EmbeddingsJobQueueV2')
    .values({
      jobType: 'embedPage:start',
      priority,
      modelId: jobModelId,
      pageId: -Math.floor(Math.random() * 1_000_000_000),
      state: 'running',
      startAt: new Date()
    })
    .returningAll()
    .executeTakeFirstOrThrow()) as EmbeddingsJobQueueV2

const jobById = (id: number) =>
  pg.selectFrom('EmbeddingsJobQueueV2').selectAll().where('id', '=', id).executeTakeFirst()

const failuresWith = (message: string) =>
  pg.selectFrom('EmbeddingsFailures').select('id').where('message', '=', message).execute()

const cleanUp = async (jobId: number, message: string) => {
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('id', '=', jobId).execute()
  await pg.deleteFrom('EmbeddingsFailures').where('message', '=', message).execute()
}

beforeEach(() => {
  run.mockReset()
  mockModel.ready.mockClear()
  mockModel.isReady = true
})

afterAll(async () => {
  await pg.destroy()
})

describe('a fill job', () => {
  it('goes back in the queue when its model goes down mid-run', async () => {
    const message = `TEI went away ${generateUID()}`
    const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1)
    run.mockImplementation(async () => {
      mockModel.isReady = false
      return new JobQueueError(message)
    })
    await orchestrator.runStep(job)
    const requeued = await jobById(job.id)
    expect(requeued?.state).toBe('queued')
    expect(requeued?.retryCount).toBe(1)
    expect(requeued?.priority).toBe(job.priority)
    expect(await failuresWith(message)).toHaveLength(0)
    expect(mockModel.ready).toHaveBeenCalled()
    await cleanUp(job.id, message)
  })

  it('gives up once it has been running each time its model went down', async () => {
    const message = `TEI went away ${generateUID()}`
    const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1)
    run.mockImplementation(async () => {
      mockModel.isReady = false
      return new JobQueueError(message)
    })
    await orchestrator.runStep({...job, retryCount: 5})
    expect(await jobById(job.id)).toBeUndefined()
    expect(await failuresWith(message)).toHaveLength(1)
    await cleanUp(job.id, message)
  })

  it('does not start while its model is down, and does not count that', async () => {
    const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1)
    mockModel.isReady = false
    await orchestrator.runStep(job)
    expect(run).not.toHaveBeenCalled()
    const requeued = await jobById(job.id)
    expect(requeued?.state).toBe('queued')
    expect(requeued?.retryCount).toBe(0)
    expect(mockModel.ready).toHaveBeenCalled()
    await cleanUp(job.id, '')
  })

  it('fails as usual when its model is fine', async () => {
    const message = `Page was deleted ${generateUID()}`
    const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1)
    run.mockResolvedValue(new JobQueueError(message))
    await orchestrator.runStep(job)
    expect(await jobById(job.id)).toBeUndefined()
    expect(await failuresWith(message)).toHaveLength(1)
    expect(mockModel.ready).not.toHaveBeenCalled()
    await cleanUp(job.id, message)
  })
})

it('stops waiting after a while, so a live job or a shutdown can get a turn', async () => {
  const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1)
  mockModel.isReady = false
  mockModel.ready.mockImplementationOnce(() => new Promise(() => {}))
  await orchestrator.runStep(job)
  expect((await jobById(job.id))?.state).toBe('queued')
  await cleanUp(job.id, '')
})

describe('a live job', () => {
  it('fails as usual while its model is down, without waiting', async () => {
    const message = `TEI went away ${generateUID()}`
    const job = await insertRunningJob(FIRST_FILL_PRIORITY - 1)
    mockModel.isReady = false
    run.mockResolvedValue(new JobQueueError(message))
    await orchestrator.runStep(job)
    expect(run).toHaveBeenCalled()
    expect(await jobById(job.id)).toBeUndefined()
    expect(await failuresWith(message)).toHaveLength(1)
    expect(mockModel.ready).not.toHaveBeenCalled()
    await cleanUp(job.id, message)
  })
})

it('runs a job queued under the id its model went by before under its id now', async () => {
  const job = await insertRunningJob(FIRST_FILL_PRIORITY + 1, 'microsoft/harrier-oss-v1-270m')
  run.mockResolvedValue(false)
  await orchestrator.runStep(job)
  expect(run).toHaveBeenCalledWith(
    expect.objectContaining({data: expect.objectContaining({modelId})})
  )
  await pg.deleteFrom('EmbeddingsJobQueueV2').where('id', '=', job.id).execute()
})
