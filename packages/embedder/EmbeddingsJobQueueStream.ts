import {Selectable, sql} from 'kysely'
import ms from 'ms'
import sleep from 'parabol-client/utils/sleep'
import 'parabol-server/initSentry'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'
import RootDataLoader from '../server/dataloader/RootDataLoader'
import {processJob} from './processJob'
import {Logger} from '../server/utils/Logger'
import {EmbeddingsTableName} from './ai_models/AbstractEmbeddingsModel'

export type DBJob = Selectable<DB['EmbeddingsJobQueue']>
export type EmbedJob = DBJob & {
  jobType: 'embed'
  jobData: {
    embeddingsMetadataId: number
    model: EmbeddingsTableName
  }
}
export type RerankJob = DBJob & {jobType: 'rerank'; jobData: {discussionIds: string[]}}
export type Job = EmbedJob | RerankJob

export class EmbeddingsJobQueueStream implements AsyncIterableIterator<Job> {
  [Symbol.asyncIterator]() {
    return this
  }
  dataLoader = new RootDataLoader({maxBatchSize: 1000})
  async next(): Promise<IteratorResult<Job>> {
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
        .executeTakeFirst()
    }
    const job = (await getJob(false)) || (await getJob(true))
    if (!job) {
      Logger.log('JobQueueStream: no jobs found')
      // queue is empty, so sleep for a while
      await sleep(ms('1m'))
      return this.next()
    }

    const isSuccessful = await processJob(job as Job, this.dataLoader)
    if (isSuccessful) {
      await pg.deleteFrom('EmbeddingsJobQueue').where('id', '=', job.id).executeTakeFirstOrThrow()
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
