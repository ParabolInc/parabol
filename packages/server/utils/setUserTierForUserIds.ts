import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import OrganizationUser from '../database/types/OrganizationUser'
import {TierEnum} from '../postgres/queries/generated/updateUserQuery'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import updateUserTiers from '../postgres/queries/updateUserTiers'
import {analytics} from './analytics/analytics'

const setUserTierForUserIds = async (userIds: string[]) => {
  const r = await getRethink()
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

  const userTrials = (await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser: RDatum<OrganizationUser>) => ({
      trialStartDate: r.table('Organization').get(orgUser('orgId'))('trialStartDate').default(null)
    }))
    .group('userId')
    .max('trialStartDate')('trialStartDate')
    .ungroup()
    .map((row) => ({
      id: row('group'),
      trialStartDate: row('reduction')
    }))
    .run()) as {id: string; trialStartDate: string | null}[]

  const userUpdates = userIds.map((userId) => {
    const userTier = userTiers.find((userTier) => userTier.id === userId)
    const userTrialStartDate = userTrials.find((userTrial) => userTrial.id === userId)
    return {
      id: userId,
      tier: userTier ? userTier.tier : 'starter',
      trialStartDate: userTrialStartDate ? userTrialStartDate.trialStartDate : null
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
