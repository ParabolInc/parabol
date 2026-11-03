import {claimEmbeddingsJob} from '../../../embedder/claimEmbeddingsJob'
import {EmbeddingsJobQueueStream} from '../../../embedder/EmbeddingsJobQueueStream'

let nextRunAfter: Date | null = null
let publish: () => void = () => {}

jest.mock('../../../embedder/claimEmbeddingsJob', () => ({claimEmbeddingsJob: jest.fn()}))
jest.mock('../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    selectFrom: () => ({
      select: () => ({
        where: () => ({executeTakeFirstOrThrow: async () => ({nextRunAfter})})
      })
    })
  })
}))
jest.mock('../../utils/RedisInstance', () => ({
  __esModule: true,
  default: class {
    on(_event: string, onMessage: () => void) {
      publish = onMessage
    }
    subscribe = async () => {}
    unsubscribe = async () => {}
  }
}))

const job = {id: 1, jobType: 'embedPage:start'}
const runStep = jest.fn(async () => {})

const startStream = () => {
  const stream = new EmbeddingsJobQueueStream({runStep})
  return stream.next()
}

beforeEach(() => {
  runStep.mockClear()
  jest.mocked(claimEmbeddingsJob).mockReset()
})

it('wakes an idle worker when the next job comes due, with nothing published', async () => {
  const delayMs = 1500
  nextRunAfter = new Date(Date.now() + delayMs)
  const isDue = () => nextRunAfter!.getTime() <= Date.now()
  jest
    .mocked(claimEmbeddingsJob)
    .mockImplementation(async () =>
      isDue() ? (job as Awaited<ReturnType<typeof claimEmbeddingsJob>>) : undefined
    )
  const {value} = await startStream()
  expect(value).toBe(job)
  expect(runStep).toHaveBeenCalledWith(job)
})

it('waits for a publish when nothing is queued', async () => {
  nextRunAfter = null
  jest.mocked(claimEmbeddingsJob).mockResolvedValue(undefined)
  const pending = startStream()
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(runStep).not.toHaveBeenCalled()
  jest
    .mocked(claimEmbeddingsJob)
    .mockResolvedValue(job as Awaited<ReturnType<typeof claimEmbeddingsJob>>)
  publish()
  const {value} = await pending
  expect(value).toBe(job)
})
