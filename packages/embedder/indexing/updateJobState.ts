import {Updateable} from 'kysely'
import getKysely from 'parabol-server/postgres/getKysely'
import {DB} from 'parabol-server/postgres/pg'

export const updateJobState = async (
  id: number,
  state: Updateable<DB['EmbeddingsJobQueue']>['state'],
  jobQueueFields: Updateable<DB['EmbeddingsJobQueue']> = {}
) => {
  const pg = getKysely()
  const jobQueueColumns: Updateable<DB['EmbeddingsJobQueue']> = {
    ...jobQueueFields,
    state
  }
  if (state === 'failed') console.log(`embedder: failed job ${id}, ${jobQueueFields.stateMessage}`)
  return pg
    .updateTable('EmbeddingsJobQueue')
    .set(jobQueueColumns)
    .where('id', '=', id)
    .executeTakeFirstOrThrow()
}
