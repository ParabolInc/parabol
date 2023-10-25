import getRethink from '../../packages/server/database/rethinkDriver'
import getPg from '../../packages/server/postgres/getPg'

export default async function setIsEnterprise() {
  if (process.env.IS_ENTERPRISE !== 'true') {
    console.log(
      'Environment variable IS_ENTERPRISE is not set to true. Exiting without updating tiers.'
    )
    process.exit()
    return
  }

  const r = await getRethink()

  console.log(
    'Updating tier to "enterprise" for Organization and OrganizationUser tables in RethinkDB'
  )

  type RethinkTableKey = 'Organization' | 'OrganizationUser'

  const tablesToUpdate: RethinkTableKey[] = ['Organization', 'OrganizationUser']

  const rethinkPromises = tablesToUpdate.map(async (table) => {
    const result = await r
      .table(table)
      .update({
        tier: 'enterprise'
      })
      .run()

    console.log(`Updated ${result.replaced} rows in ${table} table in RethinkDB.`)
    return result
  })

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

  await Promise.all([...rethinkPromises, ...pgPromises])

  console.log('Finished updating tiers.')

  await pg.end()
  process.exit()
}

setIsEnterprise()
