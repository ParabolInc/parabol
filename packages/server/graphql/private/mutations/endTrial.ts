import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const endTrial: MutationResolvers['endTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const now = new Date()
  const r = await getRethink()
  const pg = getKysely()

  const organization = await dataLoader.get('organizations').load(orgId)

  // VALIDATION
  if (!organization.trialStartDate) {
    return standardError(new Error('No trial active for org'))
  }

  // RESOLUTION
  await Promise.all([
    pg.updateTable('Organization').set({trialStartDate: null}).where('id', '=', orgId).execute(),
    r({
      orgUpdate: r.table('Organization').get(orgId).update({
        trialStartDate: null,
        updatedAt: now
      })
    }).run(),
    pg.updateTable('Team').set({trialStartDate: null}).where('orgId', '=', orgId).execute()
  ])

  const initialTrialStartDate = organization.trialStartDate
  organization.trialStartDate = null

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  return {organization, trialStartDate: initialTrialStartDate}
}

export default endTrial
