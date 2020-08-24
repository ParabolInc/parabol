import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import ActionMeetingMember from '../../../database/types/ActionMeetingMember'
import Meeting from '../../../database/types/Meeting'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import PokerMeetingMember from '../../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../../database/types/RetroMeetingMember'
import TeamMember from '../../../database/types/TeamMember'

const createMeetingMembers = (meeting: Meeting, teamMembers: TeamMember[]) => {
  const isLateArrival = teamMembers.length === 1
  const isCheckedIn = isLateArrival
  switch (meeting.meetingType) {
    case MeetingTypeEnum.action:
      return teamMembers.map(
        ({teamId, userId}) =>
          new ActionMeetingMember({teamId, userId, meetingId: meeting.id, isCheckedIn})
      )
    case MeetingTypeEnum.retrospective:
      const {id: meetingId, totalVotes} = meeting as MeetingRetrospective
      return teamMembers.map(
        ({teamId, userId}) =>
          new RetroMeetingMember({
            teamId,
            userId,
            meetingId,
            votesRemaining: totalVotes,
            isCheckedIn
          })
      )
    case MeetingTypeEnum.poker:
      return teamMembers.map(({teamId, userId}) => {
        new PokerMeetingMember({
          teamId,
          userId,
          meetingId: meeting.id,
          isCheckedIn
        })
      })
  }
}

export default createMeetingMembers
