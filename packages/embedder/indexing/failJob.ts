import getKysely from 'parabol-server/postgres/getKysely'
import {Logger} from 'parabol-server/utils/Logger'

export const failJob = async (jobId: number, stateMessage: string, retryAfter?: Date | null) => {
  const pg = getKysely()
  Logger.log(`embedder: failed job ${jobId}, ${stateMessage}`)
  await pg
    .updateTable('EmbeddingsJobQueue')
    .set((eb) => ({
      state: 'failed',
      stateMessage,
      retryCount: eb('retryCount', '+', 1),
      retryAfter: retryAfter || null
    }))
    .where('id', '=', jobId)
    .executeTakeFirstOrThrow()
}
