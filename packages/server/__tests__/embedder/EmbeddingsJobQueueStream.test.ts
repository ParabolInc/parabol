import {claimEmbeddingsJob} from '../../../embedder/claimEmbeddingsJob'
import {EmbeddingsJobQueueStream} from '../../../embedder/EmbeddingsJobQueueStream'

let nextRunAfter: Date | null = null
let publish: () => void = () => {}
let nextJobQueryIsLiveOnly = false

jest.mock('../../../embedder/claimEmbeddingsJob', () => ({claimEmbeddingsJob: jest.fn()}))
jest.mock('../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    selectFrom: () => ({
      select: () => ({
        where: () => ({
          $if: (condition: boolean) => {
            nextJobQueryIsLiveOnly = condition
            return {executeTakeFirstOrThrow: async () => ({nextRunAfter})}
          }
        })
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

it('claims only live work when told to', async () => {
  nextRunAfter = null
  jest
    .mocked(claimEmbeddingsJob)
    .mockResolvedValue(job as Awaited<ReturnType<typeof claimEmbeddingsJob>>)
  const stream = new EmbeddingsJobQueueStream({runStep}, {liveOnly: true})
  await stream.next()
  expect(claimEmbeddingsJob).toHaveBeenCalledWith(undefined, true)
})

it('wakes the live worker for live jobs only, so a fill never has it polling', async () => {
  nextRunAfter = null
  jest
    .mocked(claimEmbeddingsJob)
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce(undefined)
    .mockResolvedValue(job as Awaited<ReturnType<typeof claimEmbeddingsJob>>)
  const stream = new EmbeddingsJobQueueStream({runStep}, {liveOnly: true})
  const pending = stream.next()
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(nextJobQueryIsLiveOnly).toBe(true)
  publish()
  await pending
})
