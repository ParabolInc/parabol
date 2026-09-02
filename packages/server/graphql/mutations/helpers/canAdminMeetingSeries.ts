import type AuthToken from '../../../database/types/AuthToken'
import type {MeetingSeries} from '../../../postgres/types'
import {
  getUserId,
  isTeamMember,
  isUserBillingLeader,
  isUserInOrg
} from '../../../utils/authorization'
import type {DataLoaderWorker} from '../../graphql'

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
  meetingSeries: Pick<MeetingSeries, 'teamId' | 'ownerUserId' | 'groupId'>,
  authToken: AuthToken,
  dataLoader: DataLoaderWorker
) => {
  const {teamId, ownerUserId, groupId} = meetingSeries
  // A series scheduled for one team by that team stays the team's own business, as it always was.
  // Hard-deleting the owner nulls ownerUserId, so groupId is what keeps a series that was
  // scheduled as a group out of this branch for life.
  if (!ownerUserId && !groupId) return isTeamMember(authToken, teamId)
  // Only the org-scoped rungs are left, so the team is worth loading for its orgId now. Both
  // checks below share one organizationUsersByUserIdOrgId entry, so they are a single round trip.
  const viewerId = getUserId(authToken)
  const {orgId} = await dataLoader.get('teams').loadNonNull(teamId)
  if (ownerUserId === viewerId && (await isUserInOrg(viewerId, orgId, dataLoader))) return true
  return isUserBillingLeader(viewerId, orgId, dataLoader)
}

export default canAdminMeetingSeries
