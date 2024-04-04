import {sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {Logger} from '../server/utils/Logger'
import {WorkflowOrchestrator} from './WorkflowOrchestrator'
import {DBJob} from './custom'

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<DBJob> {
  [Symbol.asyncIterator]() {
    return this
  }

  orchestrator: WorkflowOrchestrator
  constructor(orchestrator: WorkflowOrchestrator) {
    this.orchestrator = orchestrator
  }
  async next(): Promise<IteratorResult<DBJob>> {
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
                db.where('state', '=', 'failed').where('retryAfter', '<', new Date())
              )
              .limit(1)
              .forUpdate()
              .skipLocked()
        )
        .updateTable('EmbeddingsJobQueue')
        .set({state: 'running', startAt: new Date()})
        .where('id', '=', sql<number>`ANY(SELECT id FROM ids)`)
        .returningAll()
        .executeTakeFirst() as Promise<DBJob | undefined>
    }
    const job = (await getJob(false)) || (await getJob(true))
    if (!job) {
      Logger.log('JobQueueStream: no jobs found')
      // queue is empty, so sleep for a while
      await sleep(ms('1m'))
      return this.next()
    }

    await this.orchestrator.runStep(job)
    return {done: false, value: job}
  }
  return() {
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    return Promise.resolve({done: true as const, value: error})
  }
}
