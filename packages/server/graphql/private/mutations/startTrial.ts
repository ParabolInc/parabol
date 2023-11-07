import removeTeamsLimitObjects from '../../../billing/helpers/removeTeamsLimitObjects'
import getRethink from '../../../database/rethinkDriver'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import hideConversionModal from '../../mutations/helpers/hideConversionModal'
import {MutationResolvers} from '../resolverTypes'

const startTrial: MutationResolvers['startTrial'] = async (_source, {orgId}, {dataLoader}) => {
  const r = await getRethink()
  const now = new Date()
  const organization = await dataLoader.get('organizations').load(orgId)

  // VALIDATION

  await Promise.all([
    r({
      updatedOrg: r.table('Organization').get(orgId).update({
        trialStartDate: now,
        tierLimitExceededAt: null,
        scheduledLockAt: null,
        lockedAt: null,
        updatedAt: now
      })
    }).run(),
    updateTeamByOrgId(
      {
        trialStartDate: now
      },
      orgId
    ),
    removeTeamsLimitObjects(orgId, dataLoader)
  ])
  organization.trialStartDate = now

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  await hideConversionModal(orgId, dataLoader)

  // RESOLUTION
  const data = {success: true}
  return data
}

export default startTrial
