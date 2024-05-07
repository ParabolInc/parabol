import {sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {WorkflowOrchestrator} from './WorkflowOrchestrator'
import {DBJob} from './custom'

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<DBJob> {
  [Symbol.asyncIterator]() {
    return this
  }

  orchestrator: WorkflowOrchestrator
  done: boolean

  constructor(orchestrator: WorkflowOrchestrator) {
    this.orchestrator = orchestrator
    this.done = false
  }
  async next(): Promise<IteratorResult<DBJob>> {
    if (this.done) {
      return {done: true as const, value: undefined}
    }
    const pg = getKysely()
    const getJob = (isFailed: boolean) => {
      return pg
        .with(
          (cte) => cte('ids').materialized(),
          (db) =>
            db
              .selectFrom('EmbeddingsJobQueue')
              .select('id')
              .orderBy(['priority'])
              .$if(!isFailed, (db) => db.where('state', '=', 'queued'))
              .$if(isFailed, (db) =>
                db
                  .where('state', '=', 'failed')
                  .where('retryAfter', 'is not', null)
                  .where('retryAfter', '<', new Date())
              )
              .limit(1)
              .forUpdate()
              .skipLocked()
        )
        .updateTable('EmbeddingsJobQueue')
        .set({state: 'running', startAt: new Date()})
        .where('id', '=', sql<number>`ANY(SELECT id FROM ids)`)
        .returningAll()
        .executeTakeFirst()
    }
    try {
      const job = (await getJob(false)) || (await getJob(true))
      if (!job) {
        // queue is empty, so sleep for a while
        await sleep(ms('10s'))
        return this.next()
      }
      await this.orchestrator.runStep(job)
      return {done: false, value: job}
    } catch (e) {
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
