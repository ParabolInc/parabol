import {R, RDatum, RValue} from 'rethinkdb-ts'
import getPg, {closePg} from '../../postgres/getPg'
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

  const pg = getPg()
  await Promise.all(
    userTiers.map((userTier) => {
      return pg.query(
        `UPDATE "User" AS u SET "tier" = $1::"TierEnum"
        WHERE $2 = u."id";
        `,
        [userTier.tier, userTier.id]
      )
    })
  )
  closePg()
}

export const down = function (r: R) {
  // noop
}
