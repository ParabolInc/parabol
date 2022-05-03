import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import JiraIssueId from '../../../client/shared/gqlIds/JiraIssueId'
import {Writeable} from '../../../client/types/generics'
import {ESTIMATE_TASK_SORT_ORDER} from '../../../client/utils/constants'
import getRethink from '../../database/rethinkDriver'
import EstimateStage from '../../database/types/EstimateStage'
import MeetingPoker from '../../database/types/MeetingPoker'
import {TaskServiceEnum} from '../../database/types/Task'
import {JiraDimensionField} from '../../postgres/queries/getTeamsByIds'
import insertDiscussions, {InputDiscussions} from '../../postgres/queries/insertDiscussions'
import {getUserId, isTeamMember} from '../../utils/authorization'
import ensureJiraDimensionField from '../../utils/ensureJiraDimensionField'
import getPhase from '../../utils/getPhase'
import getRedis from '../../utils/getRedis'
import publish from '../../utils/publish'
import RedisLockQueue from '../../utils/RedisLockQueue'
import {GQLContext} from '../graphql'
import UpdatePokerScopeItemInput from '../types/UpdatePokerScopeItemInput'
import UpdatePokerScopePayload from '../types/UpdatePokerScopePayload'
import getNextFacilitatorStageAfterStageRemoved from './helpers/getNextFacilitatorStageAfterStageRemoved'
import importTasksForPoker from './helpers/importTasksForPoker'

export interface TUpdatePokerScopeItemInput {
  service: TaskServiceEnum
  serviceTaskId: string
  action: 'ADD' | 'DELETE'
}

const updatePokerScope = {
  type: new GraphQLNonNull(UpdatePokerScopePayload),
  description: `Add or remove a task and its estimate phase from the meeting`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the meeting with the estimate phases to modify'
    },
    updates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UpdatePokerScopeItemInput))),
      description: 'The list of items to add/remove to the estimate phase'
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId, updates}: {meetingId: string; updates: TUpdatePokerScopeItemInput[]},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const redis = getRedis()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    // lock the meeting while the scope is updating
    const redisLock = new RedisLockQueue(`meeting:${meetingId}`, 3000)
    await redisLock.lock(10000)

    //AUTH
    const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingPoker
    if (!meeting) {
      return {error: {message: `Meeting not found`}}
    }

    const {endedAt, teamId, phases, meetingType, templateRefId, facilitatorStageId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      // bad actors could be naughty & just lock meetings that they don't own. Limit bad actors to team members
      await redisLock.unlock()
      return {error: {message: `Not on team`}}
    }
    if (endedAt) {
      return {error: {message: `Meeting already ended`}}
    }

    if (meetingType !== 'poker') {
      return {error: {message: 'Not a poker meeting'}}
    }

    // RESOLUTION

    const estimatePhase = getPhase(phases, 'ESTIMATE')
    let stages = estimatePhase.stages

    // delete stages
    const subtractiveUpdates = updates.filter((update) => {
      const {action, serviceTaskId} = update
      return action === 'DELETE' && !!stages.find((stage) => stage.serviceTaskId === serviceTaskId)
    })
    subtractiveUpdates.forEach((update) => {
      const {serviceTaskId} = update
      const stagesToRemove = stages.filter((stage) => stage.serviceTaskId === serviceTaskId)
      const removingTatorStage = stagesToRemove.find((stage) => stage.id === facilitatorStageId)
      if (removingTatorStage) {
        const nextStage = getNextFacilitatorStageAfterStageRemoved(
          facilitatorStageId,
          removingTatorStage.id,
          phases
        )
        nextStage.startAt = now
        meeting.facilitatorStageId = nextStage.id
      }
      if (stagesToRemove.length > 0) {
        // MUTATIVE
        stages = stages.filter((stage) => stage.serviceTaskId !== serviceTaskId)
        estimatePhase.stages = stages
        const writes = stagesToRemove.map((stage) => {
          return ['del', `pokerHover:${stage.id}`]
        })
        redis.multi(writes).exec()
      }
    })

    // add stages
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const firstDimensionName = dimensions[0].name
    const newDiscussions = [] as Writeable<InputDiscussions>
    const additiveUpdates = updates.filter((update) => {
      const {action, serviceTaskId} = update
      return action === 'ADD' && !stages.find((stage) => stage.serviceTaskId === serviceTaskId)
    })

    const requiredJiraMappers = additiveUpdates
      .filter((update) => update.service === 'jira')
      .map((update) => {
        const {cloudId, issueKey, projectKey} = JiraIssueId.split(update.serviceTaskId)
        return {
          cloudId,
          issueKey,
          projectKey,
          dimensionName: firstDimensionName
        } as JiraDimensionField
      })
    await ensureJiraDimensionField(requiredJiraMappers, teamId, viewerId, dataLoader)

    const additiveUpdatesWithTaskIds = await importTasksForPoker(
      additiveUpdates,
      teamId,
      viewerId,
      meetingId
    )
    let newStageIds = [] as string[]
    additiveUpdatesWithTaskIds.forEach((update) => {
      const {serviceTaskId, taskId} = update
      const lastSortOrder = stages[stages.length - 1]?.sortOrder ?? -1
      const newStages = dimensions.map(
        (_, idx) =>
          new EstimateStage({
            creatorUserId: viewerId,
            // integrationHash if integrated, else taskId
            serviceTaskId,
            sortOrder: lastSortOrder + ESTIMATE_TASK_SORT_ORDER + idx,
            taskId,
            durations: undefined,
            dimensionRefIdx: idx
          })
      )
      const discussions = newStages.map((stage) => ({
        id: stage.discussionId,
        meetingId,
        teamId,
        discussionTopicId: taskId,
        discussionTopicType: 'task' as const
      }))
      // MUTATIVE
      newDiscussions.push(...discussions)
      stages.push(...newStages)
      newStageIds = newStages.map(({id}) => id)
    })

    if (stages.length > Threshold.MAX_POKER_STORIES * dimensions.length) {
      return {error: {message: 'Story limit reached'}}
    }
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        facilitatorStageId: meeting.facilitatorStageId,
        phases,
        updatedAt: now
      })
      .run()
    if (newDiscussions.length > 0) {
      await insertDiscussions(newDiscussions)
    }
    const data = {meetingId, newStageIds}
    publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePokerScopeSuccess', data, subOptions)
    await redisLock.unlock()
    return data
  }
}

export default updatePokerScope
