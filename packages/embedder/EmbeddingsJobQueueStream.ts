import {sql} from 'kysely'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initLogging'
import getKysely from 'parabol-server/postgres/getKysely'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import type {DBJob} from './custom'
import type {WorkflowOrchestrator} from './WorkflowOrchestrator'

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<DBJob> {
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
    this.redisSub = new RedisInstance('EmbeddingsJobQueueStream')
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
  async next(): Promise<IteratorResult<DBJob>> {
    if (this.done) {
      return {done: true as const, value: undefined}
    }
    const pg = getKysely()
    const getJobBatch = () => {
      return pg
        .with(
          (cte) => cte('ids').materialized(),
          (db) =>
            db
              .selectFrom('EmbeddingsJobQueueV2')
              .select('id')
              .orderBy('priority')
              .where('state', '=', 'queued')
              .limit(1)
              .forUpdate()
              .skipLocked()
        )
        .updateTable('EmbeddingsJobQueueV2')
        .set({state: 'running', startAt: sql`CURRENT_TIMESTAMP`})
        .where('id', '=', sql<number>`ANY(SELECT id FROM ids)`)
        .returningAll()
        .executeTakeFirst()
    }
    try {
      const job = await getJobBatch()
      if (!job) {
        if (this.inDrought) {
          await new Promise<void>((resolve) => {
            if (this.droughtSignal) {
              this.droughtSignal = false
              resolve()
            } else {
              // the next time a job comes in, the onMessage handler will resolve this
              this.resolveDrought = resolve
            }
          })
          return this.next()
        }
        // the first time there's no job, start listening to jobs getting added
        // edge case: a job comes in at this point, which is why this.next() must get called after subscribe
        this.inDrought = true
        await this.redisSub.subscribe('embeddingsJobAdded')
        return this.next()
      }
      if (this.inDrought) {
        this.inDrought = false
        this.droughtSignal = false
        await this.redisSub.unsubscribe('embeddingsJobAdded')
      }
      await this.orchestrator.runStep(job)
      return {done: false, value: job}
    } catch {
      await sleep(1000)
      return this.next()
    }
  }
  return() {
    this.done = true
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    this.done = true
    return Promise.resolve({done: true as const, value: error})
  }
}
