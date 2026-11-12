import type AuthToken from '../../../database/types/AuthToken'
import type {MeetingSeries} from '../../../postgres/types'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import type {DataLoaderWorker} from '../../graphql'
import type {ResourceGrants} from '../../public/ResourceGrants'

/**
 * Decides who may read a series.
 *
 * Wider than [canAdminMeetingSeries] in exactly one way: a team the series recurs for participates
 * in it and can see it, it just cannot change it. So an owner never locks the team out of reading.
 *
 * A series still belongs to one team. Sharing a groupId with another series grants nothing — the
 * sibling has its own team, its own meetings, and its own mostRecentMeeting.
 */
const canReadMeetingSeries = async (
  meetingSeries: Pick<MeetingSeries, 'teamId' | 'ownerUserId'>,
  authToken: AuthToken,
  dataLoader: DataLoaderWorker,
  resourceGrants: ResourceGrants | undefined
) => {
  const {teamId, ownerUserId} = meetingSeries
  if (isTeamMember(authToken, teamId)) return true
  // the owner may be on none of the teams, but they scheduled it
  if (ownerUserId !== getUserId(authToken)) return false
  if (!resourceGrants) return true
  const {orgId} = await dataLoader.get('teams').loadNonNull(teamId)
  return resourceGrants.hasOrg(orgId)
}

export default canReadMeetingSeries
