import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import TimelineEventRetroComplete from '../../../database/types/TimelineEventRetroComplete'
import getKysely from '../../../postgres/getKysely'
import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {Logger} from '../../../utils/Logger'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {InternalContext} from '../../graphql'
import isValid from '../../isValid'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'
import gatherInsights from './gatherInsights'
import {generateRetroSummary} from './generateRetroSummary'
import generateWholeMeetingSentimentScore from './generateWholeMeetingSentimentScore'
import handleCompletedStage from './handleCompletedStage'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import removeEmptyTasks from './removeEmptyTasks'
import updateQualAIMeetingsCount from './updateQualAIMeetingsCount'

const getTranscription = async (recallBotId?: string | null) => {
  if (!recallBotId) return
  const manager = new RecallAIServerManager()
  return await manager.getBotTranscript(recallBotId)
}

const summarizeRetroMeeting = async (meeting: RetrospectiveMeeting, context: InternalContext) => {
  const {dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const {id: meetingId, phases, teamId, recallBotId} = meeting
  const pg = getKysely()
  const [reflectionGroups, reflections, sentimentScore, transcription] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    generateWholeMeetingSentimentScore(meetingId, dataLoader),
    getTranscription(recallBotId),
    generateRetroSummary(meetingId, dataLoader)
  ])
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const discussionIds = stages.map((stage) => stage.discussionId)

  const reflectionGroupIds = reflectionGroups.map(({id}) => id)
  const commentCounts = (
    await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)
  const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
  const taskCountRes = await pg
    .selectFrom('Task')
    .select(({fn}) => fn.count<bigint>('id').as('count'))
    .where('discussionId', 'in', discussionIds)
    .executeTakeFirst()
  await pg
    .updateTable('NewMeeting')
    .set({
      commentCount,
      taskCount: Number(taskCountRes?.count ?? 0),
      topicCount: reflectionGroupIds.length,
      reflectionCount: reflections.length,
      sentimentScore,
      transcription
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  sendNewMeetingSummary(meeting, context).catch(Logger.log)
  updateQualAIMeetingsCount(meetingId, teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'EndRetrospectiveSuccess', data, subOptions)
}

const safeEndRetrospective = async ({
  meeting,
  context,
  now
}: {
  meeting: RetrospectiveMeeting
  context: InternalContext
  now: Date
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
    stage.endAt = now
  }
  const phase = getMeetingPhase(phases)

  const insights = await gatherInsights(meeting, dataLoader)
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      phases: JSON.stringify(phases),
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement,
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
