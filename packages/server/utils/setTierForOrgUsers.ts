import getRethink from '../database/rethinkDriver'

const setTierForOrgUsers = async (orgId: string) => {
  const r = await getRethink()
  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .update(
      {
        tier: r
          .table('Organization')
          .get(orgId)
          .getField('tier')
      },
      {nonAtomic: true}
    )
    .run()
}

export default setTierForOrgUsers
