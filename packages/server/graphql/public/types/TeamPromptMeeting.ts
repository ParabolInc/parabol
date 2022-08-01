import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {TeamPromptMeetingResolvers} from '../resolverTypes'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
  meetingSeriesId: ({meetingSeriesId}, _args, _context) => {
    if (meetingSeriesId) {
      return MeetingSeriesId.join(meetingSeriesId)
    }

    return null
  },
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (meetingSeriesId) {
      const series = await dataLoader
        .get('meetingSeries')
        .load(MeetingSeriesId.join(meetingSeriesId))
      if (!series) {
        return null
      }

      return series
    }
    return null
  }
}

export default TeamPromptMeeting
