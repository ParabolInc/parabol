import {Selectable, sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'

export type DBJob = Selectable<DB['EmbeddingsJobQueue']>
export type EmbedJob = DBJob & {
  jobType: 'embed'
  jobData: {
    embeddingsMetadataId: number
    model: string
  }
}
export type RerankJob = DBJob & {jobType: 'rerank'; jobData: {discussionIds: string[]}}
export type Job = EmbedJob | RerankJob

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<Job> {
  [Symbol.asyncIterator]() {
    return this
  }
  async next(): Promise<IteratorResult<Job>> {
    const pg = getKysely()
    let job = await pg
      .with(
        (cte) => cte('ids').materialized(),
        (db) =>
          db
            .selectFrom('EmbeddingsJobQueue')
            .select('id')
            .where('state', '=', 'queued')
            .orderBy(['priority'])
            .limit(1)
            .forUpdate()
            .skipLocked()
      )
      .updateTable('EmbeddingsJobQueue')
      .set({state: 'running', startAt: new Date()})
      .where('id', '=', sql`ANY(SELECT id FROM ids)` as any)
      .returningAll()
      .executeTakeFirst()
    if (!job) {
      job = await pg
        .with(
          (cte) => cte('ids').materialized(),
          (db) =>
            db
              .selectFrom('EmbeddingsJobQueue')
              .select('id')
              .where('state', '=', 'failed')
              .where('retryAfter', '<', new Date())
              .limit(1)
              .forUpdate()
              .skipLocked()
        )
        .updateTable('EmbeddingsJobQueue')
        .set({state: 'running'})
        .where('id', '=', sql`ANY(SELECT id FROM ids)` as any)
        .returningAll()
        .executeTakeFirst()
      if (!job) {
        console.log('JobQueueStream: no jobs found')
        // queue is empty, so sleep for a while
        await sleep(ms('1m'))
        return this.next()
      }
    }
    return {done: false, value: job as Job}
  }
  return() {
    return Promise.resolve({done: true as const, value: undefined})
  }
  throw(error: any) {
    return Promise.resolve({done: true, value: error})
  }
}
