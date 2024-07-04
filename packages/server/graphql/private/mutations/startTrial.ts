import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import standardError from '../../../utils/standardError'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import {MutationResolvers} from '../resolverTypes'

const startTrial: MutationResolvers['startTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const r = await getRethink()
  const pg = getKysely()
  const now = new Date()
  const organization = await dataLoader.get('organizations').load(orgId)

  // VALIDATION
  if (organization.tier !== 'starter') {
    return standardError(new Error('Cannot start trial for organization on paid tier'))
  }
  if (organization.trialStartDate) {
    return standardError(
      new Error(`Trial already started for org. Start date: ${organization.trialStartDate}`)
    )
  }

  // RESOLUTION
  await Promise.all([
    pg
      .updateTable('Organization')
      .set({trialStartDate: now, tierLimitExceededAt: null, scheduledLockAt: null, lockedAt: null})
      .where('id', '=', orgId)
      .execute(),
    r({
      updatedOrg: r.table('Organization').get(orgId).update({
        trialStartDate: now,
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        updatedAt: now
      })
    }).run(),
    pg.updateTable('Team').set({trialStartDate: now}).where('orgId', '=', orgId).execute(),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.trialStartDate = now

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  await hideConversionModal(orgId, dataLoader)

  return {organization}
}

export default startTrial
