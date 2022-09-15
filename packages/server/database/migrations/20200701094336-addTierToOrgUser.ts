import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    const tierToOrgIds = (await r
      .table('Organization')
      .group('tier')
      .map((org) => org('id'))
      .ungroup()
      .map((group) => ({
        tier: group('group'),
        orgIds: group('reduction')
      }))
      .run()) as {tier: string; orgIds: string[]}[]

    await r(tierToOrgIds)
      .forEach((update) => {
        return r
          .table('OrganizationUser')
          .getAll(r.args(update('orgIds') as any), {index: 'orgId'})
          .update({tier: update('tier')})
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r) {
  try {
    await r
      .table('OrganizationUser')
      .replace((row) => row.without('tier'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
