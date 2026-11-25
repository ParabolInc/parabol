import type {Kysely} from 'kysely'
import getKysely from '../getKysely'
import type {DB} from '../types/pg'

interface DeleteConflictingIntegratedTaskInput {
  teamId: string
  integrationHash: string
  taskId: string
}

const deleteConflictingIntegratedTask = async (
  input: DeleteConflictingIntegratedTaskInput,
  db: Kysely<DB> = getKysely()
) => {
  const {teamId, integrationHash, taskId} = input
  return db
    .deleteFrom('Task')
    .where('integrationHash', '=', integrationHash)
    .where('teamId', '=', teamId)
    .where('id', '!=', taskId)
    .returning('id')
    .executeTakeFirst()
}

export default deleteConflictingIntegratedTask
