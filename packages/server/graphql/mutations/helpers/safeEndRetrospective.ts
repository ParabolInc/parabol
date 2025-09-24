import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import TimelineEventRetroComplete from '../../../database/types/TimelineEventRetroComplete'
import {sendSummaryEmailV2} from '../../../email/sendSummaryEmailV2'
import getKysely from '../../../postgres/getKysely'
import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {InternalContext} from '../../graphql'
import {dumpTranscriptToPage} from './dumpTranscriptToPage'
import gatherInsights, {gatherRetroInsights} from './gatherInsights'
import {generateRetroSummary} from './generateRetroSummary'
import generateWholeMeetingSentimentScore from './generateWholeMeetingSentimentScore'
import handleCompletedStage from './handleCompletedStage'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import removeEmptyTasks from './removeEmptyTasks'
import {publishSummaryPage} from './summaryPage/publishSummaryPage'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'

const summarizeRetroMeeting = async (meeting: RetrospectiveMeeting, context: InternalContext) => {
  const {dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const {id: meetingId, teamId, recallBotId} = meeting
  const pg = getKysely()

  const [sentimentScore, transcriptResult] = await Promise.all([
    generateWholeMeetingSentimentScore(meetingId, dataLoader),
    dumpTranscriptToPage(recallBotId, meetingId, dataLoader),
    generateRetroSummary(meetingId, dataLoader)
  ])
  const transcription = transcriptResult?.transcription
  await pg
    .updateTable('NewMeeting')
    .set({
      sentimentScore,
      transcription: transcription ? JSON.stringify(transcription) : null
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  updateQualAIMeetingsCount(meetingId, teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'EndRetrospectiveSuccess', data, subOptions)
}

const safeEndRetrospective = async ({
  meeting,
  context,
  info
}: {
  meeting: RetrospectiveMeeting
  context: InternalContext
  info: GraphQLResolveInfo
}) => {
  const {authToken, socketId: mutatorId, dataLoader} = context
  const {id: meetingId, phases, facilitatorStageId, teamId} = meeting
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // RESOLUTION
  const currentStageRes = findStageById(phases, facilitatorStageId)
  if (currentStageRes) {
    const {stage} = currentStageRes
    await handleCompletedStage(stage, meeting, dataLoader)
    stage.isComplete = true
    stage.endAt = new Date()
  }
  const phase = getMeetingPhase(phases)
  const [insights, retroInsights] = await Promise.all([
    gatherInsights(meeting, dataLoader),
    gatherRetroInsights(meeting, dataLoader)
  ])
  const {commentCount, taskCount, topicCount, reflectionCount} = retroInsights
  const {engagement, usedReactjis} = insights
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      phases: JSON.stringify(phases),
      usedReactjis: JSON.stringify(usedReactjis),
      engagement,
      commentCount,
      taskCount,
      topicCount,
      reflectionCount,
      summary: '<loading>' // set as "<loading>" while the AI summary is being generated
    })
    .where('id', '=', meetingId)
    .executeTakeFirst()
  dataLoader.clearAll('newMeetings')
  const completedRetrospective = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  if (completedRetrospective.meetingType !== 'retrospective') {
    return standardError(new Error('Meeting type is not retrospective'), {
      userId: viewerId
    })
  }
  // remove any empty tasks
  const {templateId} = completedRetrospective
  const [meetingMembers, team, teamMembers, removedTaskIds, template] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    removeEmptyTasks(meetingId),
    dataLoader.get('meetingTemplates').loadNonNull(templateId)
  ])
  // wait for removeEmptyTasks before summarizeRetroMeeting
  // don't await for the OpenAI response or it'll hang for a while when ending the retro
  summarizeRetroMeeting(completedRetrospective, context)
  analytics.retrospectiveEnd(completedRetrospective, meetingMembers, template, dataLoader)
  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventRetroComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const pg = getKysely()
  await pg.insertInto('TimelineEvent').values(events).execute()

  if (team.isOnboardTeam) {
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const teamLead = teamMembers.find((teamMember) => teamMember.isLead)!
    const teamLeadUserId = teamLead.userId

    const removedSuggestedActionId = await removeSuggestedAction(teamLeadUserId, 'tryRetroMeeting')
    if (removedSuggestedActionId) {
      publish(
        SubscriptionChannel.NOTIFICATION,
        teamLeadUserId,
        'EndRetrospectiveSuccess',
        {removedSuggestedActionId},
        subOptions
      )
    }
  }
  // the promise only creates the initial page, the page blocks are generated and sent after resolving
  const page = await publishSummaryPage(meetingId, context, info)
  // do not await sending the email
  sendSummaryEmailV2(meetingId, page.id, context, info)
  const data = {
    meetingId,
    teamId,
    isKill: !!(phase && phase.phaseType !== DISCUSS),
    removedTaskIds
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)
  return data
}

export default safeEndRetrospective
