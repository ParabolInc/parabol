import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import TimelineEventRetroComplete from '../../../database/types/TimelineEventRetroComplete'
import {sendSummaryEmail} from '../../../email/sendSummaryEmail'
import {meetingsEnded} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import archiveDoneTasksForMeeting from '../../../safeMutations/archiveDoneTasksForMeeting'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {Logger} from '../../../utils/Logger'
import logError from '../../../utils/logError'
import publish from '../../../utils/publish'
import type {InternalContext} from '../../graphql'
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
  const {id: meetingId, teamId} = meeting
  const pg = getKysely()

  const [sentimentScore] = await Promise.all([
    generateWholeMeetingSentimentScore(meetingId, dataLoader),
    generateRetroSummary(meetingId)
  ])
  if (sentimentScore) {
    await pg
      .updateTable('NewMeeting')
      .set({
        sentimentScore
      })
      .where('id', '=', meetingId)
      .execute()
  }
  dataLoader.clearAll('newMeetings')
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  updateQualAIMeetingsCount(meetingId, teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
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
  const {socketId: mutatorId, dataLoader} = context
  const {id: meetingId, phases, facilitatorStageId, teamId} = meeting
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // RESOLUTION
  const currentStageRes = findStageById(phases, facilitatorStageId)
  if (currentStageRes) {
    const {stage} = currentStageRes
    await handleCompletedStage(stage, meeting, dataLoader)
    stage.isComplete = true
    stage.endAt = new Date()
  }
  const phase = getMeetingPhase(phases)
  const emptyTasksRemoved = removeEmptyTasks(meetingId)
  const [insights, retroInsights, team, teamMembers, removedTaskIds] = await Promise.all([
    gatherInsights(meeting, dataLoader),
    // count the tasks once the empty ones are gone
    emptyTasksRemoved.then(() => gatherRetroInsights(meeting, dataLoader)),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    emptyTasksRemoved
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
  const isKill = !!(phase && phase.phaseType !== DISCUSS)
  const hasUpdatesPhase = phases.some((p) => p.phaseType === 'updates')
  const doneTasksArchived =
    hasUpdatesPhase && !isKill
      ? archiveDoneTasksForMeeting(teamId, meetingId)
      : Promise.resolve<string[]>([])
  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventRetroComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const removeTryRetroSuggestedAction = async () => {
    if (!team.isOnboardTeam) return
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
  const [page, updatedTaskIds] = await Promise.all([
    // the promise only creates the initial page, the page blocks are generated and sent after resolving
    publishSummaryPage(meetingId, context, info, doneTasksArchived).catch((e) => {
      logError(e instanceof Error ? e : new Error(`publishSummaryPage failed: ${e}`), {
        tags: {meetingId, op: 'publishSummaryPage'}
      })
      return null
    }),
    doneTasksArchived,
    getKysely().insertInto('TimelineEvent').values(events).execute(),
    removeTryRetroSuggestedAction()
  ])
  if (page) meeting.summaryPageId = page.id
  const data = {
    meetingId,
    teamId,
    isKill,
    removedTaskIds,
    updatedTaskIds
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)
  // wait for removeEmptyTasks before summarizeRetroMeeting
  // don't await these, but put them after both "publish" calls so the dataloader has the same data
  summarizeRetroMeeting(meeting, context).catch(Logger.log)
  // do not await sending the email
  if (page) sendSummaryEmail(meetingId, page.id, context, info).catch(Logger.log)
  meetingsEnded.inc({meeting_type: meeting.meetingType})

  return data
}

export default safeEndRetrospective
