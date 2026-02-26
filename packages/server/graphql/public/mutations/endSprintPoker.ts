import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
// TODO: TimelineEventPokerComplete is from the deprecated /database directory
import TimelineEventPokerComplete from '../../../database/types/TimelineEventPokerComplete'
import {sendSummaryEmailV2} from '../../../email/sendSummaryEmailV2'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isSuperUser, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import getRedis from '../../../utils/getRedis'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import gatherInsights from '../../mutations/helpers/gatherInsights'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import removeEmptyTasks from '../../mutations/helpers/removeEmptyTasks'
import {publishSummaryPage} from '../../mutations/helpers/summaryPage/publishSummaryPage'
import type {MutationResolvers} from '../resolverTypes'

const endSprintPoker: MutationResolvers['endSprintPoker'] = async (
  _source,
  {meetingId},
  context,
  info
) => {
  const {authToken, socketId: mutatorId, dataLoader} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = new Date()
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (meeting.meetingType !== 'poker') {
    return standardError(new Error('Meeting is not a poker meeting'), {userId: viewerId})
  }
  const {endedAt, facilitatorStageId, phases, teamId} = meeting

  // VALIDATION
  if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
    return standardError(new Error('Not on team'), {userId: viewerId})
  }
  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  const estimatePhase = getPhase(phases, 'ESTIMATE')
  const {stages: estimateStages} = estimatePhase
  if (estimateStages.length > 0) {
    const redisKeys = estimateStages.map((stage) => `pokerHover:${stage.id}`)
    const redis = getRedis()
    redis.del(...redisKeys)
  }
  const currentStageRes = findStageById(phases, facilitatorStageId)
  if (currentStageRes) {
    const {stage} = currentStageRes
    stage.isComplete = true
    stage.endAt = now
  }
  const phase = getMeetingPhase(phases)
  const storyCount = new Set(
    estimateStages.filter(({isComplete}) => isComplete).map(({taskId}) => taskId)
  ).size
  const discussionIds = estimateStages.map((stage) => stage.discussionId)
  const insights = await gatherInsights(meeting, dataLoader)
  const commentCounts = (
    await dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds)
  ).filter(isValid)
  const commentCount = commentCounts.reduce((cumSum, count) => cumSum + count, 0)
  await getKysely()
    .updateTable('NewMeeting')
    .set({
      endedAt: sql`CURRENT_TIMESTAMP`,
      phases: JSON.stringify(phases),
      commentCount,
      storyCount,
      usedReactjis: JSON.stringify(insights.usedReactjis),
      engagement: insights.engagement
    })
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')
  const completedMeeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  if (completedMeeting.meetingType !== 'poker') {
    return standardError(new Error('Meeting is not a poker meeting'), {userId: viewerId})
  }
  const {templateId} = completedMeeting
  const [meetingMembers, team, teamMembers, removedTaskIds, template] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    removeEmptyTasks(meetingId),
    dataLoader.get('meetingTemplates').loadNonNull(templateId)
  ])
  const isKill = !!(phase && phase.phaseType !== 'ESTIMATE')
  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventPokerComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const pg = getKysely()
  await pg.insertInto('TimelineEvent').values(events).execute()
  const page = await publishSummaryPage(meetingId, context, info)
  completedMeeting.summaryPageId = page.id
  const data = {meetingId, teamId, isKill, removedTaskIds}
  publish(SubscriptionChannel.TEAM, teamId, 'EndSprintPokerSuccess', data, subOptions)
  sendSummaryEmailV2(meetingId, page.id, context, info).catch(Logger.log)
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId).catch(Logger.log)
  analytics.sprintPokerEnd(completedMeeting, meetingMembers, template, dataLoader).catch(Logger.log)
  return data
}

export default endSprintPoker
