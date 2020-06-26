import getRethink from '../database/rethinkDriver'
import db from '../db'
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
