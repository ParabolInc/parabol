import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {TeamPromptMeetingResolvers} from '../resolverTypes'
import getRethink from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
  meetingSeriesId: ({meetingSeriesId}, _args, _context) => {
    if (meetingSeriesId) {
      return MeetingSeriesId.join(meetingSeriesId)
    }

    return null
  },
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (meetingSeriesId) {
      const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
      if (!series) {
        return null
      }

      return series
    }
    return null
  },
  prevMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (meetingSeriesId) {
      const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
      if (!series || series.cancelledAt) {
        return null
      }

      const r = await getRethink()
      const meetings = await r
        .table('NewMeeting')
        .getAll(meetingSeriesId, {index: 'meetingSeriesId'})
        .filter({meetingType: 'teamPrompt'})
        .filter((row) => row('createdAt').lt(createdAt))
        .orderBy(r.desc('createdAt'))
        .limit(1)
        .run()

      return meetings[0] as MeetingTeamPrompt
    }
    return null
  },
  nextMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (meetingSeriesId) {
      const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
      if (!series || series.cancelledAt) {
        return null
      }

      const r = await getRethink()
      const meetings = await r
        .table('NewMeeting')
        .getAll(meetingSeriesId, {index: 'meetingSeriesId'})
        .filter({meetingType: 'teamPrompt'})
        .filter((doc) => doc('createdAt').gt(createdAt))
        .orderBy(r.asc('createdAt'))
        .limit(1)
        .run()

      return meetings[0] as MeetingTeamPrompt
    }
    return null
  }
}

export default TeamPromptMeeting
