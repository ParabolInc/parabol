import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import {sendSummaryEmail} from '../../../email/sendSummaryEmail'
import {meetingsEnded} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {InternalContext} from '../../graphql'
import gatherInsights from './gatherInsights'
import generateStandupMeetingSummary from './generateStandupMeetingSummary'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import {publishSummaryPage} from './summaryPage/publishSummaryPage'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'

const summarizeTeamPrompt = async (meeting: TeamPromptMeeting, context: InternalContext) => {
  const {dataLoader} = context
  const pg = getKysely()

  const summary = await generateStandupMeetingSummary(meeting, dataLoader)
  await pg.updateTable('NewMeeting').set({summary}).where('id', '=', meeting.id).execute()

  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  updateQualAIMeetingsCount(meeting.id, meeting.teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meeting.id, meeting.teamId)
  return summary
}

const safeEndTeamPrompt = async ({
  meeting,
  context,
  info
}: {
  meeting: TeamPromptMeeting
  context: InternalContext
  info: GraphQLResolveInfo
}) => {
  const pg = getKysely()
  const {authToken, socketId: mutatorId, dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)
  const {endedAt, id: meetingId, teamId} = meeting

  if (endedAt)
    return standardError(new Error('Meeting already ended'), {
      userId: viewerId
    })

  // RESOLUTION
  const [insights, team, teamMembers] = await Promise.all([
    gatherInsights(meeting, dataLoader),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId)
  ])
  await pg
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement,
      summary: '<loading>' // set as "<loading>" while the AI summary is being generated
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamPromptComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  meetingsEnded.inc({meeting_type: meeting.meetingType})
  const [page] = await Promise.all([
    publishSummaryPage(meetingId, context, info).catch((e) => {
      logError(e instanceof Error ? e : new Error(`publishSummaryPage failed: ${e}`), {
        tags: {meetingId, op: 'publishSummaryPage'}
      })
      return null
    }),
    pg.insertInto('TimelineEvent').values(events).execute()
  ])
  if (page) meeting.summaryPageId = page.id
  const data = {
    meetingId,
    teamId
  }
  publish(
    SubscriptionChannel.MEETING,
    meeting.id,
    'EndTeamPromptSuccess',
    {meetingId},
    {operationId}
  )
  publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
  // the AI summary can take seconds, so the meeting ends without it, like a retro does
  summarizeTeamPrompt(meeting, context).catch((e) => {
    logError(e instanceof Error ? e : new Error(`summarizeTeamPrompt failed: ${e}`), {
      tags: {meetingId, op: 'summarizeTeamPrompt'}
    })
  })
  // do not await sending the email
  if (page) sendSummaryEmail(meetingId, page.id, context, info).catch(Logger.log)
  return data
}

export default safeEndTeamPrompt
