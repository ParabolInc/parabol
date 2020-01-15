import getRethink from '../database/rethinkDriver'

const setUserTierForOrgId = async (orgId: string) => {
  const r = await getRethink()
  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .coerceTo('array')
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
}

export default setUserTierForOrgId
