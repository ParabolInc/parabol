import getKysely from '../../../postgres/getKysely'
import type {DataLoaderWorker} from '../../graphql'

/**
 * Hands a departing member's series to the org, so the owner rung is never empty.
 *
 * An owner who is out of the org fails the tenancy check in canAdminMeetingSeries, and a
 * hard-deleted one is nulled outright by the ownerUserId foreign key, which would make the series
 * look like it never had an owner & quietly widen who may administer it. Naming a successor here
 * keeps the series owned by someone who is actually still around.
 *
 * Call once billing leader succession has run, so a freshly promoted leader is a candidate.
 */
const reassignMeetingSeriesOwner = async (
  ownerUserId: string,
  orgId: string,
  orgTeamIds: string[],
  dataLoader: DataLoaderWorker
) => {
  if (orgTeamIds.length === 0) return
  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const leaders = orgUsers.filter(({role}) => role === 'BILLING_LEADER' || role === 'ORG_ADMIN')
  // the longest-tenured, the same tie-break that fills the billing leader rung itself
  const [successor] = leaders.sort((a, b) => (a.joinedAt < b.joinedAt ? -1 : 1))
  // the last member left, so the teams are empty & there is nobody to hand it to
  if (!successor) return
  await getKysely()
    .updateTable('MeetingSeries')
    .set({ownerUserId: successor.userId})
    .where('ownerUserId', '=', ownerUserId)
    .where('teamId', 'in', orgTeamIds)
    .execute()
}

export default reassignMeetingSeriesOwner
