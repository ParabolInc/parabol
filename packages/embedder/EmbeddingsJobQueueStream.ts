import {sql} from 'kysely'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initLogging'
import getKysely from 'parabol-server/postgres/getKysely'
import type {EmbeddingsJobQueueV2} from 'parabol-server/postgres/types'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import type {JobType} from './custom'
import type {WorkflowOrchestrator} from './WorkflowOrchestrator'

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<EmbeddingsJobQueueV2> {
  [Symbol.asyncIterator]() {
    return this
  }

  orchestrator: WorkflowOrchestrator
  done: boolean
  redisSub: RedisInstance
  resolveDrought: PromiseWithResolvers<void>['resolve'] | undefined
  inDrought = false
  droughtSignal = false

  constructor(orchestrator: WorkflowOrchestrator) {
    this.orchestrator = orchestrator
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
  private cachedClaimQuery = getKysely()
    .updateTable('EmbeddingsJobQueueV2')
    .set({
      state: 'running',
      // Use raw SQL for the DB-side timestamp so parameters stay empty/static
      startAt: sql`CURRENT_TIMESTAMP`
    })
    .where('id', '=', (eb) =>
      eb
        .selectFrom('EmbeddingsJobQueueV2')
        .select('id')
        .where('state', '=', 'queued')
        .orderBy('priority', 'asc')
        .orderBy('id', 'asc')
        .limit(1)
        .forUpdate()
        .skipLocked()
    )
    .returningAll()
    .$narrowType<{jobType: JobType; jobData: Record<string, any>}>()
    .compile()
  async next(): Promise<IteratorResult<EmbeddingsJobQueueV2>> {
    const pg = getKysely()
    while (!this.done) {
      try {
        const {rows} = await pg.executeQuery(this.cachedClaimQuery)
        const job = rows[0]

        if (!job) {
          if (!this.inDrought) {
            this.inDrought = true
            await this.redisSub.subscribe('embeddingsJobAdded')
            // Re-run the query immediately to catch any jobs that have come after the query was completed
            continue
          }

          // Wait for a signal without recursing
          await new Promise<void>((resolve) => {
            if (this.droughtSignal) {
              this.droughtSignal = false
              resolve()
            } else {
              // the next time a job comes in, the onMessage handler will resolve this
              this.resolveDrought = resolve
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
