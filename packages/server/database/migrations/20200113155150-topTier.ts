import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('User')
      .update(
        (user) => ({
          tier: r
            .table('OrganizationUser')
            .getAll(user('id'), {index: 'userId'})
            .filter({removedAt: null})('orgId')
            .coerceTo('array')
            .distinct()
            .do((orgIds) =>
              r.table('Organization').getAll(r.args(orgIds))('tier').distinct().coerceTo('array')
            )
            .do((tiers) => {
              return r.branch(
                tiers.contains('enterprise'),
                'enterprise',
                tiers.contains('pro'),
                'pro',
                'personal'
              )
            })
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('User')
      .replace((row) => row.without('tier'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
