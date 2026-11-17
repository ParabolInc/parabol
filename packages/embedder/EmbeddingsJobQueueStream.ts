import sleep from 'parabol-client/utils/sleep'
import getKysely from '../server/postgres/getKysely'
import type {EmbeddingsJobQueueV2} from '../server/postgres/types'
import RedisInstance from '../server/utils/RedisInstance'
import {claimEmbeddingsJob} from './claimEmbeddingsJob'
import {FIRST_FILL_PRIORITY} from './getEmbedderJobPriority'
import {getNextJobDelay} from './getNextJobDelay'

const MIN_DROUGHT_WAIT_MS = 1000

interface JobRunner {
  runStep: (job: EmbeddingsJobQueueV2) => Promise<void>
}

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<EmbeddingsJobQueueV2> {
  [Symbol.asyncIterator]() {
    return this
  }

  orchestrator: JobRunner
  liveOnly: boolean
  done: boolean
  redisSub: RedisInstance
  resolveDrought: PromiseWithResolvers<void>['resolve'] | undefined
  inDrought = false
  droughtSignal = false

  constructor(orchestrator: JobRunner, {liveOnly = false}: {liveOnly?: boolean} = {}) {
    this.orchestrator = orchestrator
    this.liveOnly = liveOnly
    this.done = false
    this.redisSub = new RedisInstance('EmbeddingsJobQueueStream_sub')
    this.redisSub.on('message', () => {
      if (this.resolveDrought) {
        const resolve = this.resolveDrought
        this.resolveDrought = undefined
        resolve()
      } else {
        // if there's no promise yet, the message arrived at the same time as the query was executing
        this.droughtSignal = true
      }
    })
  }
  async next(): Promise<IteratorResult<EmbeddingsJobQueueV2>> {
    while (!this.done) {
      try {
        const job = await claimEmbeddingsJob(undefined, this.liveOnly)

        if (!job) {
          if (!this.inDrought) {
            this.inDrought = true
            await this.redisSub.subscribe('embeddingsJobAdded')
            // Re-run the query immediately to catch any jobs that have come after the query was completed
            continue
          }

          // Wait without recursing for a signal, or until the next delayed job is due
          const {nextRunAfter} = await getKysely()
            .selectFrom('EmbeddingsJobQueueV2')
            .select(({fn}) => fn.min('runAfter').as('nextRunAfter'))
            .where('state', '=', 'queued')
            .$if(this.liveOnly, (qb) => qb.where('priority', '<', FIRST_FILL_PRIORITY))
            .executeTakeFirstOrThrow()
          const delay = getNextJobDelay(nextRunAfter, new Date())
          await new Promise<void>((resolve) => {
            if (this.droughtSignal) {
              this.droughtSignal = false
              resolve()
              return
            }
            const timer = setTimeout(
              () => {
                this.resolveDrought = undefined
                resolve()
              },
              Math.max(delay, MIN_DROUGHT_WAIT_MS)
            )
            // the next time a job comes in, the onMessage handler will resolve this
            this.resolveDrought = () => {
              clearTimeout(timer)
              resolve()
            }
          })
          continue
        }
        if (this.inDrought) {
          this.inDrought = false
          this.droughtSignal = false
          await this.redisSub.unsubscribe('embeddingsJobAdded')
        }

        await this.orchestrator.runStep(job)
        return {done: false, value: job}
      } catch (err) {
        console.error('Job Stream error, retrying...', err)
        await sleep(1000)
      }
    }
    return {done: true, value: undefined}
  }
  return() {
    this.done = true
    if (this.resolveDrought) {
      this.resolveDrought()
      this.resolveDrought = undefined
    }
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    this.done = true
    return Promise.resolve({done: true as const, value: error})
  }
}
