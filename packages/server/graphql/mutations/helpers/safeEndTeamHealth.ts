import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEventTeamHealthComplete from '../../../database/types/TimelineEventTeamHealthComplete'
import {sendSummaryEmailV2} from '../../../email/sendSummaryEmailV2'
import getKysely from '../../../postgres/getKysely'
import type {TeamHealthMeeting} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {InternalContext} from '../../graphql'
import gatherInsights from './gatherInsights'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
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

  const [completedTeamHealth, meetingMembers, team, teamMembers] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId) as Promise<TeamHealthMeeting>,
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId)
  ])

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamHealthComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  await pg.insertInto('TimelineEvent').values(events).execute()
  analytics.teamHealthEnd(completedTeamHealth, meetingMembers, dataLoader)
  const page = await publishSummaryPage(meetingId, context, info).catch((e) => {
    logError(e instanceof Error ? e : new Error(`publishSummaryPage failed: ${e}`), {
      tags: {meetingId, op: 'publishSummaryPage'}
    })
    return null
  })
  if (page) completedTeamHealth.summaryPageId = page.id
  await summarizeTeamHealth(completedTeamHealth, context)
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
  if (page) sendSummaryEmailV2(meetingId, page.id, context, info).catch(Logger.log)
  return data
}

export default safeEndTeamHealth
