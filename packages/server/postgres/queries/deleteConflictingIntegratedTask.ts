import type {Kysely} from 'kysely'
import getKysely from '../getKysely'
import type {DB} from '../types/pg'

interface DeleteConflictingIntegratedTaskInput {
  teamId: string
  integrationHash: string
}

const deleteConflictingIntegratedTask = async (
  input: DeleteConflictingIntegratedTaskInput,
  db: Kysely<DB> = getKysely()
) => {
  const {teamId, integrationHash} = input
  return db
    .deleteFrom('Task')
    .where('integrationHash', '=', integrationHash)
    .where('teamId', '=', teamId)
    .returning('id')
    .executeTakeFirst()
}

export default deleteConflictingIntegratedTask
