import ms from 'ms'
import getKysely from 'parabol-server/postgres/getKysely'

export const resetStalledJobs = () => {
  setInterval(async () => {
    const pg = getKysely()
    await pg
      .updateTable('EmbeddingsJobQueue')
      .set((eb) => ({
        state: 'queued',
        startAt: null,
        retryCount: eb('retryCount', '+', 1),
        stateMessage: 'stalled'
      }))
      .where('startAt', '<', new Date(Date.now() - ms('5m')))
      .where('state', '=', 'running')
      .execute()
  }, ms('5m')).unref()
}
