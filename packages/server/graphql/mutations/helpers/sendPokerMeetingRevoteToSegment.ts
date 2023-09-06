import Meeting from '../../../database/types/Meeting'
import MeetingMember from '../../../database/types/MeetingMember'
import TeamMember from '../../../database/types/TeamMember'
import {analytics} from '../../../utils/analytics/analytics'

const sendPokerMeetingRevoteToSegment = async (
  meeting: Meeting,
  teamMembers: TeamMember[],
  meetingMembers: MeetingMember[]
) => {
  const {facilitatorUserId, meetingNumber, phases, teamId} = meeting
  const presentMemberUserIds = meetingMembers.map(({userId}) => userId)
  presentMemberUserIds.forEach((userId) => {
    const wasFacilitator = userId === facilitatorUserId
    analytics.pokerMeetingTeamRevoted(
      userId,
      teamId,
      phases[0]?.phaseType === 'checkin',
      wasFacilitator,
      meetingNumber,
      teamMembers.length,
      meetingMembers.length
    )
  })
}

export default sendPokerMeetingRevoteToSegment
