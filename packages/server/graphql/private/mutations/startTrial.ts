import {GraphQLError} from 'graphql'
import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const startTrial: MutationResolvers['startTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const pg = getKysely()
  const now = new Date()
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  if (organization.tier !== 'starter') {
    throw new GraphQLError('Cannot start trial for organization on paid tier', {
      extensions: {code: 'CONFLICT'}
    })
  }
  if (organization.trialStartDate) {
    throw new GraphQLError(
      `Trial already started for org. Start date: ${organization.trialStartDate}`,
      {extensions: {code: 'CONFLICT'}}
    )
  }

  // RESOLUTION
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({
        trialStartDate: now,
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null
      })
      .where('id', '=', orgId)
      .execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.trialStartDate = now

  return {orgId}
}

export default startTrial
