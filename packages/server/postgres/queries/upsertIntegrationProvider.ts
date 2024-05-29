import {Insertable} from 'kysely'
import getKysely from '../getKysely'
import type {DB} from '../pg'

const upsertIntegrationProvider = async (provider: Insertable<DB['IntegrationProvider']>) => {
  const pg = getKysely()
  const newRow = await pg
    .insertInto('IntegrationProvider')
    .values(provider)
    .onConflict((oc) =>
      oc.columns(['teamId', 'service', 'authStrategy']).doUpdateSet({
        ...provider,
        isActive: true
      })
    )
    .executeTakeFirst()

  return newRow.insertId
}

export default upsertIntegrationProvider
