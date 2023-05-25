import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {TeamPromptMeetingResolvers} from '../resolverTypes'
import getRethink from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {getUserId} from '../../../utils/authorization'
import filterTasksByMeeting from '../../../utils/filterTasksByMeeting'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
  meetingSeriesId: ({meetingSeriesId}, _args, _context) => {
    if (meetingSeriesId) {
      return MeetingSeriesId.join(meetingSeriesId)
    }

    return null
  },
  meetingSeries: async ({meetingSeriesId}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null

    const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
    if (!series) {
      return null
    }

    return series
  },
  prevMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null

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
  },
  nextMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null

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
  },
  tasks: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {teamId} = meeting
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return filterTasksByMeeting(teamTasks, meetingId, viewerId)
  }
}

export default TeamPromptMeeting
