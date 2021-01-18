import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const now = new Date()
  try {
    const duplicateUserIds = await r
      .table('OrganizationUser')
      .filter({removedAt: null})
      .group('userId', 'orgId')
      .count()
      .ungroup()
      .filter((row) => row('reduction').gt(1))('group')
      .map((row) => row.nth(0)) // just return the userIds, not the orgIds
      .distinct()
      .run()

    const duplicateOrgUsers = await r
      .table('OrganizationUser')
      .getAll(r.args(duplicateUserIds), {index: 'userId'})
      .filter({removedAt: null})
      .group(
        'userId',
        'orgId'
      )('id')
      .run()

    const duplicatesToRemove = duplicateOrgUsers
      .map((user) => user['reduction'].slice(1, user['reduction'].length))
      .filter((user) => user.length)
      .flat()

    await r
      .table('OrganizationUser')
      .getAll(r.args(duplicatesToRemove))
      .update({removedAt: now, removalReason: 'duplicate'})
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('OrganizationUser')
      .filter((orgUser) => orgUser('removalReason').eq('duplicate'))
      .update({removedAt: null, removalReason: null})
      .run()
  } catch (e) {
    console.log(e)
  }
}
