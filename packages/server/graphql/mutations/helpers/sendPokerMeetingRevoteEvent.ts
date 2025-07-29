import type {TeamMember} from '../../../postgres/types'
import type {AnyMeeting, AnyMeetingMember} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import type {DataLoaderWorker} from '../../graphql'

const sendPokerMeetingRevoteEvent = async (
  meeting: AnyMeeting,
  teamMembers: TeamMember[],
  meetingMembers: AnyMeetingMember[],
  dataLoader: DataLoaderWorker
) => {
  const {facilitatorUserId, meetingNumber, phases, teamId} = meeting
  const presentMemberUserIds = meetingMembers.map(({userId}) => userId)
  return presentMemberUserIds.map(async (userId) => {
    const wasFacilitator = userId === facilitatorUserId
    const user = await dataLoader.get('users').load(userId)
    if (user) {
      analytics.pokerMeetingTeamRevoted(user, {
        teamId,
        hasIcebreaker: phases[0]?.phaseType === 'checkin',
        wasFacilitator,
        meetingNumber,
        teamMembersCount: teamMembers.length,
        teamMembersPresentCount: meetingMembers.length
      })
    }
  })
}

export default sendPokerMeetingRevoteEvent
