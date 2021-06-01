import getRethink from '../database/rethinkDriver'
import db from '../db'
import getPg from '../postgres/getPg'
import {TierEnum} from '../postgres/queries/generated/updateUserQuery'
import {updateUserTiersQuery} from '../postgres//queries/generated/updateUserTiersQuery'
import catchAndLog from '../postgres/utils/catchAndLog'
import segmentIo from './segmentIo'

const setUserTierForUserIds = async (userIds: string[]) => {
  const r = await getRethink()
  await r
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
    .run()

  const userTiers = (await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser) => ({
      tier: r
        .table('Organization')
        .get(orgUser('orgId'))('tier')
        .default('personal')
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

  await Promise.all(userIds.map((userId) => db.clear('User', userId)))
  const users = await db.readMany('User', userIds)
  users.forEach((user) => {
    segmentIo.identify({
      userId: user.id,
      traits: {
        highestTier: user.tier
      }
    })
  })
}

export default setUserTierForUserIds
