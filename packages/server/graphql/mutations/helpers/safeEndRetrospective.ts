import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DISCUSS} from 'parabol-client/utils/constants'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
import {checkTeamsLimit} from '../../../billing/helpers/teamLimitsCheck'
import getRethink from '../../../database/rethinkDriver'
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
import generateWholeMeetingSentimentScore from './generateWholeMeetingSentimentScore'
import generateWholeMeetingSummary from './generateWholeMeetingSummary'
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
  const {id: meetingId, phases, facilitatorUserId, teamId, recallBotId} = meeting
  const pg = getKysely()
  const r = await getRethink()
  const [reflectionGroups, reflections, sentimentScore] = await Promise.all([
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    generateWholeMeetingSentimentScore(meetingId, facilitatorUserId!, dataLoader)
  ])
  const discussPhase = getPhase(phases, 'discuss')
  const {stages} = discussPhase
  const discussionIds = stages.map((stage) => stage.discussionId)

  const reflectionGroupIds = reflectionGroups.map(({id}) => id)
  const [summary, transcription] = await Promise.all([
    generateWholeMeetingSummary(discussionIds, meetingId, teamId, facilitatorUserId!, dataLoader),
    getTranscription(recallBotId)
  ])
  const commentCounts = (
    await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)
  const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
  const taskCount = await r
    .table('Task')
    .getAll(r.args(discussionIds), {index: 'discussionId'})
    .count()
    .default(0)
    .run()
  await pg
    .updateTable('NewMeeting')
    .set({
      commentCount,
      taskCount,
      topicCount: reflectionGroupIds.length,
      reflectionCount: reflections.length,
      sentimentScore,
      summary,
      transcription
    })
    .where('id', '=', meetingId)
    .execute()
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        commentCount,
        taskCount,
        topicCount: reflectionGroupIds.length,
        reflectionCount: reflections.length,
        sentimentScore,
        summary,
        transcription
      },
      {nonAtomic: true}
    )
    .run()

  dataLoader.clearAll('newMeetings')
  // wait for whole meeting summary to be generated before sending summary email and updating qualAIMeetingCount
  sendNewMeetingSummary(meeting, context).catch(Logger.log)
  updateQualAIMeetingsCount(meetingId, teamId, dataLoader)
  // wait for meeting stats to be generated before sending Slack notification
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId)
  const data = {meetingId}
  const operationId = dataLoader.share()
  const subOptions = {operationId}
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
  const r = await getRethink()
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
  const completedRetrospective = await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        endedAt: now,
        phases,
        ...insights
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      phases: JSON.stringify(phases),
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement
    })
    .where('id', '=', meetingId)
    .executeTakeFirst()
  dataLoader.clearAll('newMeetings')
  if (!completedRetrospective) {
    return standardError(new Error('Completed retrospective meeting does not exist'), {
      userId: viewerId
    })
  }
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
  checkTeamsLimit(team.orgId, dataLoader)
  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventRetroComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const timelineEventId = events[0]!.id
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
    removedTaskIds,
    timelineEventId
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndRetrospectiveSuccess', data, subOptions)

  return data
}

export default safeEndRetrospective
