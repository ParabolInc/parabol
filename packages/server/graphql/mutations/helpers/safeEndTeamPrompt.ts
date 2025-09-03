import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import {sendSummaryEmailV2} from '../../../email/sendSummaryEmailV2'
import getKysely from '../../../postgres/getKysely'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {InternalContext} from '../../graphql'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'
import gatherInsights from './gatherInsights'
import generateStandupMeetingSummary from './generateStandupMeetingSummary'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import {publishSummaryPage} from './summaryPage/publishSummaryPage'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'

const summarizeTeamPrompt = async (
  meeting: TeamPromptMeeting,
  makePagesSummary: boolean,
  context: InternalContext
) => {
  const {dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const pg = getKysely()

  const summary = await generateStandupMeetingSummary(meeting, dataLoader)
  await pg.updateTable('NewMeeting').set({summary}).where('id', '=', meeting.id).execute()

  dataLoader.clearAll('newMeetings')
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  if (!makePagesSummary) {
    sendNewMeetingSummary(meeting, false, context).catch(Logger.log)
  }
  updateQualAIMeetingsCount(meeting.id, meeting.teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meeting.id, meeting.teamId)
  const data = {meetingId: meeting.id}
  publish(SubscriptionChannel.MEETING, meeting.id, 'EndTeamPromptSuccess', data, subOptions)
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
  const insights = await gatherInsights(meeting, dataLoader)
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

  const [completedTeamPrompt, meetingMembers, team, teamMembers, responses] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    getTeamPromptResponsesByMeetingId(meetingId)
  ])

  const makePagesSummary = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: team.orgId, featureName: 'Pages'})

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamPromptComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  await pg.insertInto('TimelineEvent').values(events).execute()
  summarizeTeamPrompt(meeting, makePagesSummary, context)
  analytics.teamPromptEnd(completedTeamPrompt, meetingMembers, responses, dataLoader)
  const page = await publishSummaryPage(meetingId, context, info)
  if (makePagesSummary) {
    // do not await sending the email
    sendSummaryEmailV2(meetingId, page.id, context, info)
  }
  dataLoader.get('newMeetings').clear(meetingId)
  const data = {
    gotoPageSummary: makePagesSummary,
    meetingId,
    teamId
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
  return data
}

export default safeEndTeamPrompt
