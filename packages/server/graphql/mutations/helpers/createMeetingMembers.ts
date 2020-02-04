import Meeting from '../../../database/types/Meeting'
import RetroMeetingMember from '../../../database/types/RetroMeetingMember'
import {DataLoaderWorker} from '../../graphql'
import {IRetrospectiveMeetingSettings, MeetingTypeEnum} from '../../../../client/types/graphql'
import TeamMember from '../../../database/types/TeamMember'
import ActionMeetingMember from '../../../database/types/ActionMeetingMember'

const createMeetingMembers = async (
  meeting: Meeting,
  teamMembers: TeamMember[],
  dataLoader: DataLoaderWorker
) => {
  switch (meeting.meetingType) {
    case MeetingTypeEnum.action:
      return teamMembers.map(
        ({teamId, userId}) =>
          new ActionMeetingMember({teamId, userId, meetingId: meeting.id, isCheckedIn: true})
      )
    case MeetingTypeEnum.retrospective:
      const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(meeting.teamId)
      const retroSettings = (allSettings.find(
        (settings) => settings.meetingType === meeting.meetingType
      ) as unknown) as IRetrospectiveMeetingSettings
      const {totalVotes} = retroSettings
      return teamMembers.map(
        ({teamId, userId}) =>
          new RetroMeetingMember({
            teamId,
            userId,
            meetingId: meeting.id,
            votesRemaining: totalVotes,
            isCheckedIn: true
          })
      )
  }
}

export default createMeetingMembers
