import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {TeamPromptMeetingResolvers} from '../resolverTypes'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (meetingSeriesId) {
      MeetingSeriesId.join(meetingSeriesId)
      const series = await dataLoader
        .get('meetingSeries')
        .load(MeetingSeriesId.join(meetingSeriesId))
      if (!series) {
        return null
      } else {
        return series
      }
    }
    return null
  }
}

export default TeamPromptMeeting
