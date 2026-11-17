import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const endTrial: MutationResolvers['endTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const pg = getKysely()

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  if (!organization.trialStartDate) {
    throw new GraphQLError('No trial active for org', {extensions: {code: 'CONFLICT'}})
  }

  // RESOLUTION
  await pg.updateTable('Organization').set({trialStartDate: null}).where('id', '=', orgId).execute()

  const initialTrialStartDate = organization.trialStartDate
  organization.trialStartDate = null

  return {orgId, trialStartDate: initialTrialStartDate}
}

export default endTrial
