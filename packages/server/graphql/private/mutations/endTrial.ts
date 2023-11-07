import getRethink from '../../../database/rethinkDriver'
import Organization from '../../../database/types/Organization'
import getKysely from '../../../postgres/getKysely'
import updateTeamByOrgId from '../../../postgres/queries/updateTeamByOrgId'
import setTierForOrgUsers from '../../../utils/setTierForOrgUsers'
import setUserTierForOrgId from '../../../utils/setUserTierForOrgId'
import {MutationResolvers} from '../resolverTypes'

const endTrial: MutationResolvers['endTrial'] = async (_source, {orgId}) => {
  const now = new Date()
  const r = await getRethink()
  const pg = getKysely()

  await Promise.all([
    r.table('Organization').get(orgId).run() as unknown as Organization,
    pg.updateTable('SAML').set({metadata: null}).where('orgId', '=', orgId).execute(),
    r({
      orgUpdate: r.table('Organization').get(orgId).update({
        periodEnd: now,
        trialStartDate: null,
        stripeSubscriptionId: null,
        updatedAt: now
      })
    }).run(),
    updateTeamByOrgId(
      {
        trialStartDate: null,
        isPaid: true
      },
      orgId
    )
  ])

  await Promise.all([setUserTierForOrgId(orgId), setTierForOrgUsers(orgId)])

  // VALIDATION

  // RESOLUTION
  const data = {success: true}
  return data
}

export default endTrial
