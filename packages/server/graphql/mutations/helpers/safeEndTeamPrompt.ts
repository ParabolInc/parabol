import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {checkTeamsLimit} from '../../../billing/helpers/teamLimitsCheck'
import TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import getKysely from '../../../postgres/getKysely'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {Logger} from '../../../utils/Logger'
import {analytics} from '../../../utils/analytics/analytics'
import publish, {SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {InternalContext} from '../../graphql'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'
import gatherInsights from './gatherInsights'
import generateStandupMeetingSummary from './generateStandupMeetingSummary'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'
import updateTeamInsights from './updateTeamInsights'

const summarizeTeamPrompt = async (meeting: TeamPromptMeeting, context: InternalContext) => {
  const {dataLoader} = context
  const pg = getKysely()

  const summary = await generateStandupMeetingSummary(meeting, dataLoader)
  if (summary) {
    await pg.updateTable('NewMeeting').set({summary}).where('id', '=', meeting.id).execute()
  }

  dataLoader.clearAll('newMeetings')
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
  viewerId,
  context,
  subOptions
}: {
  meeting: TeamPromptMeeting
  viewerId?: string
  context: InternalContext
  subOptions: SubOptions
}) => {
  const pg = getKysely()
  const {dataLoader} = context

  const {endedAt, id: meetingId, teamId} = meeting

  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  const insights = await gatherInsights(meeting, dataLoader)
  await pg
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')

  const [completedTeamPrompt, meetingMembers, team, teamMembers, responses] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
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
  await pg.insertInto('TimelineEvent').values(events).execute()
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
