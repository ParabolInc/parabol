import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TeamPromptMeetingMember from '../../../database/types/TeamPromptMeetingMember'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {getUserId} from '../../../utils/authorization'
import filterTasksByMeeting from '../../../utils/filterTasksByMeeting'
import getPhase from '../../../utils/getPhase'
import {TeamPromptMeetingResolvers} from '../resolverTypes'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
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
      .filter((row: RValue) => row('createdAt').lt(createdAt))
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
      .filter((doc: RValue) => doc('createdAt').gt(createdAt))
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
  },

  settings: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
  },

  responses: ({id: meetingId}, _args, {}) => {
    return getTeamPromptResponsesByMeetingId(meetingId)
  },

  viewerMeetingMember: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    return (meetingMember as TeamPromptMeetingMember) || null
  },

  responseCount: async ({id: meetingId}) => {
    return (await getTeamPromptResponsesByMeetingId(meetingId)).filter(
      (response) => !!response.plaintextContent
    ).length
  },

  taskCount: async ({id: meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting.meetingType !== 'teamPrompt') {
      return 0
    }
    const {phases} = meeting
    const discussPhase = getPhase(phases, 'RESPONSES')
    const {stages} = discussPhase
    const discussionIds = stages.map((stage) => stage.discussionId)
    const r = await getRethink()
    return r
      .table('Task')
      .getAll(r.args(discussionIds), {index: 'discussionId'})
      .count()
      .default(0)
      .run()
  },

  commentCount: async ({id: meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting.meetingType !== 'teamPrompt') {
      return 0
    }
    const {phases} = meeting
    const discussPhase = getPhase(phases, 'RESPONSES')
    const {stages} = discussPhase
    const discussionIds = stages.map((stage) => stage.discussionId)
    const r = await getRethink()
    return r
      .table('Comment')
      .getAll(r.args(discussionIds), {index: 'discussionId'})
      .filter({isActive: true})
      .count()
      .default(0)
      .run()
  }
}

export default TeamPromptMeeting
