import getRethink from '../database/rethinkDriver'
import {RDatum, RValue} from '../database/stricterR'
import OrganizationUser from '../database/types/OrganizationUser'
import User from '../database/types/User'
import {updateUserTiersQuery} from '../postgres//queries/generated/updateUserTiersQuery'
import getPg from '../postgres/getPg'
import {TierEnum} from '../postgres/queries/generated/updateUserQuery'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import catchAndLog from '../postgres/utils/catchAndLog'
import segmentIo from './segmentIo'

const setUserTierForUserIds = async (userIds: string[]) => {
  const r = await getRethink()
  await r
    .table('User')
    .getAll(r.args(userIds))
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
              tiers.contains('team'),
              'team',
              'starter'
            )
          })
      }),
      {nonAtomic: true}
    )
    .run()

  const userTiers = (await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser: RDatum<OrganizationUser>) => ({
      tier: r.table('Organization').get(orgUser('orgId'))('tier').default('starter')
    }))
    .group('userId')('tier')
    .ungroup()
    .map((row) => ({
      id: row('group'),
      tier: r.branch(
        row('reduction').contains('enterprise'),
        'enterprise',
        row('reduction').contains('team'),
        'team',
        'starter'
      )
    }))
    .run()) as {id: string; tier: TierEnum}[]
  await catchAndLog(() => updateUserTiersQuery.run({users: userTiers}, getPg()))

  const users = await getUsersByIds(userIds)
  users.forEach((user) => {
    user &&
      segmentIo.identify({
        userId: user.id,
        traits: {
          email: user.email,
          highestTier: user.tier
        }
      })
  })
}

export default setUserTierForUserIds
