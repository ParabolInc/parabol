import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {checkTeamsLimit} from '../../../billing/helpers/teamLimitsCheck'
import getRethink, {ParabolR} from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {analytics} from '../../../utils/analytics/analytics'
import publish, {SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {InternalContext} from '../../graphql'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import updateTeamInsights from './updateTeamInsights'
import generateStandupMeetingSummary from './generateStandupMeetingSummary'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'
import gatherInsights from './gatherInsights'
import {Logger} from '../../../utils/Logger'

const summarizeTeamPrompt = async (meeting: MeetingTeamPrompt, context: InternalContext) => {
  const {dataLoader} = context
  const r = await getRethink()

  const summary = await generateStandupMeetingSummary(meeting, dataLoader)

  await r
    .table('NewMeeting')
    .get(meeting.id)
    .update({
      summary
    })
    .run()

  dataLoader.get('newMeetings').clear(meeting.id)
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  sendNewMeetingSummary(meeting, context).catch(Logger.log)
  updateQualAIMeetingsCount(meeting.id, meeting.teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meeting.id, meeting.teamId)
  const data = {meetingId: meeting.id}
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  publish(SubscriptionChannel.MEETING, meeting.id, 'EndTeamPromptSuccess', data, subOptions)
}

const safeEndTeamPrompt = async ({
  meeting,
  now,
  viewerId,
  r,
  context,
  subOptions
}: {
  meeting: MeetingTeamPrompt
  now: Date
  viewerId?: string
  r: ParabolR
  context: InternalContext
  subOptions: SubOptions
}) => {
  const {dataLoader} = context

  const {endedAt, id: meetingId, teamId} = meeting

  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  const insights = await gatherInsights(meeting, dataLoader)
  const completedTeamPrompt = (await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        endedAt: now,
        ...insights
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()) as unknown as MeetingTeamPrompt

  if (!completedTeamPrompt) {
    return standardError(new Error('Completed team prompt meeting does not exist'), {
      userId: viewerId
    })
  }

  const [meetingMembers, team, teamMembers, responses] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    getTeamPromptResponsesByMeetingId(meetingId),
    updateTeamInsights(teamId, dataLoader)
  ])

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamPromptComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const timelineEventId = events[0]!.id
  await r.table('TimelineEvent').insert(events).run()
  summarizeTeamPrompt(meeting, context)
  analytics.teamPromptEnd(completedTeamPrompt, meetingMembers, responses, dataLoader)
  checkTeamsLimit(team.orgId, dataLoader)
  dataLoader.get('newMeetings').clear(meetingId)

  const data = {
    meetingId,
    teamId,
    timelineEventId
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
  return data
}

export default safeEndTeamPrompt
