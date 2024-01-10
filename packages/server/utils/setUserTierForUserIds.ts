import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import OrganizationUser from '../database/types/OrganizationUser'
import {TierEnum} from '../postgres/queries/generated/updateUserQuery'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import updateUserTiers from '../postgres/queries/updateUserTiers'
import {analytics} from './analytics/analytics'

// This doesn't actually read any tier/trial fields on the 'OrganizationUser' object - these fields
// come directly from 'Organization' instead. As a result, this can be run in parallel with
// 'setTierForOrgUsers'.
const setUserTierForUserIds = async (userIds: string[]) => {
  const r = await getRethink()
  const userTiers = (await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser: RDatum<OrganizationUser>) => ({
      tier: r.table('Organization').get(orgUser('orgId'))('tier').default('starter'),
      trialStartDate: r.table('Organization').get(orgUser('orgId'))('trialStartDate').default(null)
    }))
    .group('userId')
    .ungroup()
    .map((row) => ({
      id: row('group'),
      tier: r.branch(
        row('reduction')('tier').contains('enterprise'),
        'enterprise',
        row('reduction')('tier').contains('team'),
        'team',
        'starter'
      ),
      trialStartDate: r.max(row('reduction')('trialStartDate'))
    }))
    .run()) as {id: string; tier: TierEnum; trialStartDate: string | null}[]

  const userUpdates = userIds.map((userId) => {
    const userTier = userTiers.find((userTier) => userTier.id === userId)
    return {
      id: userId,
      tier: userTier ? userTier.tier : 'starter',
      trialStartDate: userTier ? userTier.trialStartDate : null
    }
  })
  await updateUserTiers({users: userUpdates})

  const users = await getUsersByIds(userIds)
  users.forEach((user) => {
    user &&
      analytics.identify({
        userId: user.id,
        email: user.email,
        highestTier: user.tier
      })
  })
}

export default setUserTierForUserIds
