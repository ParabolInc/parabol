import {R, RDatum, RValue} from 'rethinkdb-ts'
import getPg, {closePg} from '../../postgres/getPg'
import {updateUserTiersQuery} from '../../postgres/queries/generated/updateUserTiersQuery'
import {getUsersByIds} from '../../postgres/queries/getUsersByIds'
import catchAndLog from '../../postgres/utils/catchAndLog'
import segmentIo from '../../utils/segmentIo'
import {TierEnum} from '../types/Invoice'
import OrganizationUser from '../types/OrganizationUser'
import User from '../types/User'

export const up = async function (r: R) {
  const removedOrgUserIds = await r
    .table('OrganizationUser')
    .hasFields('removedAt')
    .filter((row) => row('tier').ne('personal'))('userId')
    .distinct()
    .run()

  await r
    .table('User')
    .getAll(r.args(removedOrgUserIds))
    .update(
      (user: RDatum<User>) => ({
        tier: r
          .table('OrganizationUser')
          .getAll(user('id'), {index: 'userId'})
          .filter({removedAt: null})('orgId')
          .coerceTo('array')
          .distinct()
          .do((orgIds: RValue) =>
            r.table('Organization').getAll(r.args(orgIds))('tier').distinct().coerceTo('array')
          )
          .do((tiers: RDatum<string[]>) => {
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

  const userTiers = (await r
    .table('OrganizationUser')
    .getAll(r.args(removedOrgUserIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser: RDatum<OrganizationUser>) => ({
      tier: r.table('Organization').get(orgUser('orgId'))('tier').default('personal')
    }))
    .group('userId')('tier')
    .ungroup()
    .map((row) => ({
      id: row('group'),
      tier: r.branch(
        row('reduction').contains('enterprise'),
        'enterprise',
        row('reduction').contains('pro'),
        'pro',
        'personal'
      )
    }))
    .run()) as {id: string; tier: TierEnum}[]

  await catchAndLog(() => updateUserTiersQuery.run({users: userTiers}, getPg()))
  const users = await getUsersByIds(removedOrgUserIds)
  users.forEach((user) => {
    user &&
      segmentIo.identify({
        userId: user.id,
        traits: {
          highestTier: user.tier
        }
      })
  })
  closePg()
}

export const down = function (r: R) {
  // noop
}
