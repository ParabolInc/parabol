import getKysely from '../../../postgres/getKysely'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {selectNewMeetings} from '../../../postgres/select'
import {TeamPromptMeeting as TeamPromptMeetingSource} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import filterTasksByMeeting from '../../../utils/filterTasksByMeeting'
import getPhase from '../../../utils/getPhase'
import isValid from '../../isValid'
import {TeamPromptMeetingResolvers} from '../resolverTypes'

const TeamPromptMeeting: TeamPromptMeetingResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamPrompt',
  prevMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null

    const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
    if (!series || series.cancelledAt) {
      return null
    }

    const meeting = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .where('meetingType', '=', 'teamPrompt')
      .where('createdAt', '<', createdAt)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .$narrowType<TeamPromptMeetingSource>()
      .executeTakeFirst()
    return meeting || null
  },
  nextMeeting: async ({meetingSeriesId, createdAt}, _args, {dataLoader}) => {
    if (!meetingSeriesId) return null

    const series = await dataLoader.get('meetingSeries').load(meetingSeriesId)
    if (!series || series.cancelledAt) {
      return null
    }
    const meeting = await selectNewMeetings()
      .where('meetingSeriesId', '=', meetingSeriesId)
      .where('meetingType', '=', 'teamPrompt')
      .where('createdAt', '>', createdAt)
      .orderBy('createdAt', 'asc')
      .limit(1)
      .$narrowType<TeamPromptMeetingSource>()
      .executeTakeFirst()
    return meeting || null
  },
  tasks: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {teamId} = meeting
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return filterTasksByMeeting(teamTasks, meetingId, viewerId)
  },

  settings: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
  },

  responses: ({id: meetingId}, _args) => {
    return getTeamPromptResponsesByMeetingId(meetingId)
  },

  responseCount: async ({id: meetingId}) => {
    return (await getTeamPromptResponsesByMeetingId(meetingId)).filter(
      (response) => !!response.plaintextContent
    ).length
  },

  taskCount: async ({id: meetingId}, _args, {dataLoader}) => {
    const pg = getKysely()
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') {
      return 0
    }
    const {phases} = meeting
    const discussPhase = getPhase(phases, 'RESPONSES')
    const {stages} = discussPhase
    const discussionIds = stages.map((stage) => stage.discussionId)
    const taskCountRes = await pg
      .selectFrom('Task')
      .select(({fn}) => fn.count<bigint>('id').as('count'))
      .where('discussionId', 'in', discussionIds)
      .executeTakeFirst()
    return Number(taskCountRes?.count ?? 0)
  },

  commentCount: async ({id: meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') {
      return 0
    }
    const {phases} = meeting
    const discussPhase = getPhase(phases, 'RESPONSES')
    const {stages} = discussPhase
    const discussionIds = stages.map((stage) => stage.discussionId)
    const commentCounts = (
      await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
    ).filter(isValid)
    const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
    return commentCount
  },

  summary: ({summary}) => (summary === '<loading>' ? null : summary),
  isLoadingSummary: ({summary}) => summary === '<loading>'
}

export default TeamPromptMeeting
