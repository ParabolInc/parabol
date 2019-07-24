import Meeting from '../../../database/types/Meeting'
import MeetingMember from '../../../database/types/MeetingMember'
import RetroMeetingMember from '../../../database/types/RetroMeetingMember'
import {DataLoaderWorker} from '../../graphql'
import {IRetrospectiveMeetingSettings, ITeamMember} from '../../../../universal/types/graphql'

const createMeetingMembers = async (
  meeting: Meeting,
  teamMembers: ITeamMember[],
  dataLoader: DataLoaderWorker
) => {
  switch (meeting.meetingType) {
    case 'action':
      return teamMembers.map(
        ({teamId, userId}) => new MeetingMember(teamId, userId, meeting.meetingType, meeting.id)
      )
    case 'retrospective':
      const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(meeting.teamId)
      const retroSettings = (allSettings.find(
        (settings) => settings.meetingType === meeting.meetingType
      ) as unknown) as IRetrospectiveMeetingSettings
      const {totalVotes} = retroSettings
      return teamMembers.map(
        ({teamId, userId}) =>
          new RetroMeetingMember(teamId, userId, meeting.meetingType, meeting.id, totalVotes)
      )
  }
}

export default createMeetingMembers
