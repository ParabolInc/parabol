import ms from 'ms'
import getKysely from 'parabol-server/postgres/getKysely'
import {FAILED_JOB_PENALTY} from './getEmbedderJobPriority'

export const resetStalledJobs = () => {
  setInterval(async () => {
    const pg = getKysely()
    await pg
      .updateTable('EmbeddingsJobQueueV2')
      .set((eb) => ({
        state: 'queued',
        startAt: null,
        retryCount: eb('retryCount', '+', 1),
        stateMessage: 'stalled',
        priority: eb('priority', '+', FAILED_JOB_PENALTY)
      }))
      .where('startAt', '<', new Date(Date.now() - ms('5m')))
      .where('state', '=', 'running')
      .execute()
  }, ms('5m')).unref()
}
