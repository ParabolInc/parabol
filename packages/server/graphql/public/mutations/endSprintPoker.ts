import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getMeetingPhase from 'parabol-client/utils/getMeetingPhase'
import findStageById from 'parabol-client/utils/meetings/findStageById'
// TODO: TimelineEventPokerComplete is from the deprecated /database directory
import TimelineEventPokerComplete from '../../../database/types/TimelineEventPokerComplete'
import {sendSummaryEmail} from '../../../email/sendSummaryEmail'
import {meetingsEnded} from '../../../metricsHandler'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
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
  const [insights, commentCounts, team, teamMembers, removedTaskIds] = await Promise.all([
    gatherInsights(meeting, dataLoader),
    dataLoader.get('commentCountByDiscussionId').loadMany(discussionIds),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    removeEmptyTasks(meetingId)
  ])
  const commentCount = commentCounts.filter(isValid).reduce((cumSum, count) => cumSum + count, 0)
  const pg = getKysely()
  await pg
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
  const [page] = await Promise.all([
    publishSummaryPage(meetingId, context, info),
    pg.insertInto('TimelineEvent').values(events).execute()
  ])
  meeting.summaryPageId = page.id
  const data = {meetingId, teamId, isKill, removedTaskIds}
  publish(SubscriptionChannel.TEAM, teamId, 'EndSprintPokerSuccess', data, subOptions)
  sendSummaryEmail(meetingId, page.id, context, info).catch(Logger.log)
  IntegrationNotifier.endMeeting(dataLoader, meetingId, teamId).catch(Logger.log)
  meetingsEnded.inc({meeting_type: meeting.meetingType})
  return data
}

export default endSprintPoker
