import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {MutationResolvers} from '../resolverTypes'

const endTrial: MutationResolvers['endTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const now = new Date()
  const r = await getRethink()
  const pg = getKysely()

  const organization = await dataLoader.get('organizations').load(orgId)

  // VALIDATION
  if (!organization.trialStartDate) {
    throw new Error('No trial active for org')
  }

  // RESOLUTION
  await Promise.all([
    r({
      orgUpdate: r.table('Organization').get(orgId).update({
        periodEnd: now,
        trialStartDate: null,
        stripeSubscriptionId: null,
        updatedAt: now
      })
    }).run(),
    pg.updateTable('Team').set({trialStartDate: null}).where('orgId', '=', orgId).execute()
  ])

  const initialTrialStartDate = organization.trialStartDate
  organization.trialStartDate = null

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  const data = {organization, trialStartDate: initialTrialStartDate}
  return data
}

export default endTrial
