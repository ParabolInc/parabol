import type AuthToken from '../../../database/types/AuthToken'
import type {MeetingSeries} from '../../../postgres/types'
import {getUserId, isTeamMember} from '../../../utils/authorization'

/**
 * Decides who may read a series.
 *
 * Wider than [canAdminMeetingSeries] in exactly one way: a team the series recurs for participates
 * in it and can see it, it just cannot change it. So an owner never locks the team out of reading.
 *
 * A series still belongs to one team. Sharing a groupId with another series grants nothing — the
 * sibling has its own team, its own meetings, and its own mostRecentMeeting.
 */
const canReadMeetingSeries = (
  meetingSeries: Pick<MeetingSeries, 'teamId' | 'ownerUserId'>,
  authToken: AuthToken
) => {
  const {teamId, ownerUserId} = meetingSeries
  // the owner may be on none of the teams, but they scheduled it
  if (ownerUserId === getUserId(authToken)) return true
  return isTeamMember(authToken, teamId)
}

export default canReadMeetingSeries
