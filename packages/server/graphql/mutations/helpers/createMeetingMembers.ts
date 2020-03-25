import {MeetingTypeEnum} from '../../../../client/types/graphql'
import ActionMeetingMember from '../../../database/types/ActionMeetingMember'
import Meeting from '../../../database/types/Meeting'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import RetroMeetingMember from '../../../database/types/RetroMeetingMember'
import TeamMember from '../../../database/types/TeamMember'

const createMeetingMembers = (meeting: Meeting, teamMembers: TeamMember[]) => {
  switch (meeting.meetingType) {
    case MeetingTypeEnum.action:
      return teamMembers.map(
        ({teamId, userId}) =>
          new ActionMeetingMember({teamId, userId, meetingId: meeting.id, isCheckedIn: true})
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
            isCheckedIn: true
          })
      )
  }
}

export default createMeetingMembers
