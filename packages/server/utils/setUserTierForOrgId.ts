import getRethink from '../database/rethinkDriver'
import db from '../db'

const setUserTierForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const userIds = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .run()
  await r(userIds)
    .do((userIds) => {
      return r
        .table('User')
        .getAll(r.args(userIds))
        .update(
          (user) => ({
            tier: r
              .table('OrganizationUser')
              .getAll(user('id'), {index: 'userId'})
              .filter({removedAt: null})('orgId')
              .coerceTo('array')
              .distinct()
              .do((orgIds) =>
                r
                  .table('Organization')
                  .getAll(r.args(orgIds))('tier')
                  .distinct()
                  .coerceTo('array')
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
    })
    .run()
  await Promise.all(userIds.map((userId) => db.clear('User', userId)))
}

export default setUserTierForOrgId
