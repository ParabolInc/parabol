import getKysely from '../server/postgres/getKysely'

// An edit that lands while the job runs moves runAfter past startAt, so the job runs again instead of ending
export const finishEmbeddingsJob = async (jobId: number) => {
  const db = getKysely()
  const {numDeletedRows} = await db
    .deleteFrom('EmbeddingsJobQueueV2')
    .where('id', '=', jobId)
    .where((eb) => eb('runAfter', '<=', eb.ref('startAt')))
    .executeTakeFirst()
  if (numDeletedRows > 0n) return
  await db
    .updateTable('EmbeddingsJobQueueV2')
    .set({state: 'queued', startAt: null})
    .where('id', '=', jobId)
    .execute()
}
