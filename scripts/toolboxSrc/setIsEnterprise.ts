import getKysely from 'parabol-server/postgres/getKysely'
import getRethink from '../../packages/server/database/rethinkDriver'
import getPg from '../../packages/server/postgres/getPg'
import {defaultTier} from '../../packages/server/utils/defaultTier'

export default async function setIsEnterprise() {
  if (defaultTier !== 'enterprise') {
    throw new Error(
      'Environment variable IS_ENTERPRISE is not set to true. Exiting without updating tiers.'
    )
  }

  const r = await getRethink()

  console.log(
    'Updating tier to "enterprise" for Organization and OrganizationUser tables in RethinkDB'
  )

  await getKysely().updateTable('Organization').set({tier: 'enterprise'}).execute()
  await r
    .table('OrganizationUser')
    .update({
      tier: 'enterprise'
    })
    .run()

  const pg = getPg()

  const updateUserPromise = pg
    .query(`UPDATE "User" SET tier = 'enterprise' RETURNING id`)
    .then((res) => {
      console.log('Updated User tier to enterprise for:', res.rows.length, 'records in PostgreSQL.')
      return res
    })

  const updateTeamPromise = pg
    .query(`UPDATE "Team" SET tier = 'enterprise' RETURNING id`)
    .then((res) => {
      console.log('Updated Team tier to enterprise for:', res.rows.length, 'records in PostgreSQL.')
      return res
    })

  const pgPromises = [updateUserPromise, updateTeamPromise]

  await Promise.all(pgPromises)

  console.log('Finished updating tiers.')

  await pg.end()
  process.exit()
}

setIsEnterprise()
