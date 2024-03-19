import ms from 'ms'
import getKysely from 'parabol-server/postgres/getKysely'

export const resetStalledJobs = () => {
  setInterval(async () => {
    const pg = getKysely()
    await pg
      .updateTable('EmbeddingsJobQueue')
      .set({state: 'queued', startAt: null})
      .where('startAt', '<', new Date(Date.now() - ms('5m')))
      .execute()
  }, ms('5m'))
}
