import getRethink from '../../../database/rethinkDriver'
import TimelineEventTeamPromptCompleteModel from '../../../database/types/TimelineEventTeamPromptComplete'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import getPhase from '../../../utils/getPhase'
import {Maybe, ResolversTypes, TimelineEventTeamPromptCompleteResolvers} from '../resolverTypes'
import {timelineEventInterfaceResolvers} from './TimelineEvent'

export type TimelineEventTeamPromptCompleteSource = Pick<
  TimelineEventTeamPromptCompleteModel,
  keyof TimelineEventTeamPromptCompleteModel
>

const TimelineEventTeamPromptComplete: TimelineEventTeamPromptCompleteResolvers = {
  ...timelineEventInterfaceResolvers(),
  __isTypeOf: ({type}) => type === 'TEAM_PROMPT_COMPLETE',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return (meeting.meetingType !== 'teamPrompt' ? null : meeting) as Maybe<
      ResolversTypes['TeamPromptMeeting']
    >
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  responseCount: async ({meetingId}) => {
    return (await getTeamPromptResponsesByMeetingId(meetingId)).filter(
      (response) => !!response.plaintextContent
    ).length
  },
  taskCount: async ({meetingId}, _args: unknown, {dataLoader}) => {
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
  commentCount: async ({meetingId}, _args: unknown, {dataLoader}) => {
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

export default TimelineEventTeamPromptComplete
