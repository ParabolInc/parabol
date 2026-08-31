import type AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
import type {MeetingSeries} from '../../../postgres/types'
import {
  getUserId,
  isTeamMember,
  isUserBillingLeader,
  isUserInOrg
} from '../../../utils/authorization'
import type {DataLoaderWorker} from '../../graphql'

/**
 * Whether another team is still running this series alongside us.
 *
 * A null groupId is a certificate that no sibling can exist, since nothing else can share a null,
 * so it answers for free. A set groupId only says the series *started* multi-team: archiving a
 * team cancels its sibling, which can leave a lone survivor that is an ordinary single-team
 * series and should be administered like one.
 */
const hasLiveGroupSiblings = async (meetingSeries: Pick<MeetingSeries, 'id' | 'groupId'>) => {
  const {id, groupId} = meetingSeries
  if (!groupId) return false
  const sibling = await getKysely()
    .selectFrom('MeetingSeries')
    .select('id')
    .where('groupId', '=', groupId)
    .where('id', '!=', id)
    .where('cancelledAt', 'is', null)
    .limit(1)
    .executeTakeFirst()
  return !!sibling
}

/**
 * Decides who may rename, reschedule, cancel, or start a series ahead of schedule. These writes
 * fan out over the whole group, so this is the gate that stops one team acting for the others.
 *
 * Authority is never pinned to one person. The owner is a fast path, and the org's billing leaders
 * are a rung that cannot go empty: removeFromOrg promotes the longest-tenured member when the last
 * billing leader leaves. So an owner who departs, or is simply away, never strands a series, and
 * an ex-employee keeps no authority once they are out of the org.
 */
const canAdminMeetingSeries = async (
  meetingSeries: Pick<MeetingSeries, 'id' | 'teamId' | 'ownerUserId' | 'groupId'>,
  authToken: AuthToken,
  dataLoader: DataLoaderWorker
) => {
  const {teamId, ownerUserId} = meetingSeries
  // An unowned series with nobody else on it stays the team's own business, as it always was.
  // First because the checks are free whenever groupId is null, which is the common case.
  if (
    !ownerUserId &&
    isTeamMember(authToken, teamId) &&
    !(await hasLiveGroupSiblings(meetingSeries))
  ) {
    return true
  }
  // Only the org-scoped rungs are left, so the team is worth loading for its orgId now. Both
  // checks below share one organizationUsersByUserIdOrgId entry, so they are a single round trip.
  const viewerId = getUserId(authToken)
  const {orgId} = await dataLoader.get('teams').loadNonNull(teamId)
  if (ownerUserId === viewerId && (await isUserInOrg(viewerId, orgId, dataLoader))) return true
  return isUserBillingLeader(viewerId, orgId, dataLoader)
}

export default canAdminMeetingSeries
