import Meeting from '../../../database/types/Meeting'
import MeetingMember from '../../../database/types/MeetingMember'
import {TeamMember} from '../../../postgres/types'
import {analytics} from '../../../utils/analytics/analytics'
import {DataLoaderWorker} from '../../graphql'

const sendPokerMeetingRevoteEvent = async (
  meeting: Meeting,
  teamMembers: TeamMember[],
  meetingMembers: MeetingMember[],
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
