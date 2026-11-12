import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEventTeamHealthComplete from '../../../database/types/TimelineEventTeamHealthComplete'
import {sendSummaryEmail} from '../../../email/sendSummaryEmail'
import {meetingsEnded} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {InternalContext} from '../../graphql'
import gatherInsights from './gatherInsights'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import queueTeamHealthCategorySummaries from './queueTeamHealthCategorySummaries'
import sortTeamHealthResultStages from './sortTeamHealthResultStages'
import summarizeTeamHealthCategories from './summarizeTeamHealthCategories'
import {publishSummaryPage} from './summaryPage/publishSummaryPage'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'

const summarizeTeamHealth = async (meeting: TeamHealthMeeting, context: InternalContext) => {
  const {dataLoader} = context
  // wait for the meeting to be marked as ended before updating qualAIMeetingCount
  updateQualAIMeetingsCount(meeting.id, meeting.teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meeting.id, meeting.teamId)
}

const safeEndTeamHealth = async ({
  meeting,
  context,
  info
}: {
  meeting: TeamHealthMeeting
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
  const [insights, phases, team, teamMembers] = await Promise.all([
    gatherInsights(meeting, dataLoader),
    sortTeamHealthResultStages(meeting, dataLoader),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId)
  ])
  // ending a team health meeting is what reveals its results, whether the owner clicked "Reveal
  // results" or the recurrence cron hit scheduledEndTime. The result stages render the reveal off
  // endedAt, so the only stage state to flip is their order, which the answers now determine
  await pg
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      phases: JSON.stringify(phases),
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const categorySummariesQueued = queueTeamHealthCategorySummaries(meeting, dataLoader).catch(
    (e) => {
      logError(
        e instanceof Error ? e : new Error(`queueTeamHealthCategorySummaries failed: ${e}`),
        {
          tags: {meetingId, op: 'queueTeamHealthCategorySummaries'}
        }
      )
    }
  )
  categorySummariesQueued.then(() => summarizeTeamHealthCategories(meetingId)).catch(Logger.log)

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamHealthComplete({
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
    pg.insertInto('TimelineEvent').values(events).execute(),
    categorySummariesQueued
  ])
  if (page) meeting.summaryPageId = page.id
  await summarizeTeamHealth(meeting, context)
  const data = {
    meetingId,
    teamId
  }
  publish(
    SubscriptionChannel.MEETING,
    meeting.id,
    'EndTeamHealthSuccess',
    {meetingId},
    {operationId}
  )
  publish(SubscriptionChannel.TEAM, teamId, 'EndTeamHealthSuccess', data, subOptions)
  // do not await sending the email
  if (page) sendSummaryEmail(meetingId, page.id, context, info).catch(Logger.log)
  return data
}

export default safeEndTeamHealth
