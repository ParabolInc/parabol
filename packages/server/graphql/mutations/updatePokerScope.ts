import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {Insertable} from 'kysely'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {ESTIMATE_TASK_SORT_ORDER} from '../../../client/utils/constants'
import findStageById from '../../../client/utils/meetings/findStageById'
import EstimateStage from '../../database/types/EstimateStage'
import getKysely from '../../postgres/getKysely'
import {Discussion} from '../../postgres/types/pg'
import {TaskServiceEnum} from '../../postgres/types/TaskIntegration'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import getRedis from '../../utils/getRedis'
import {Logger} from '../../utils/Logger'
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
    const pg = getKysely()
    const redis = getRedis()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    // lock the meeting while the scope is updating
    const redisLock = new RedisLockQueue(`meeting:${meetingId}`, 3000)
    await redisLock.lock(10000)

    // Wrap everything in try catch to ensure the lock is released
    try {
      //AUTH
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (!meeting) {
        return {error: {message: `Meeting not found`}}
      }
      if (meeting.meetingType !== 'poker') {
        return {error: {message: 'Not a poker meeting'}}
      }
      const {endedAt, teamId, phases, templateRefId, facilitatorStageId} = meeting
      if (!isTeamMember(authToken, teamId)) {
        // bad actors could be naughty & just lock meetings that they don't own. Limit bad actors to team members
        return {error: {message: `Not on team`}}
      }
      if (endedAt) {
        return {error: {message: `Meeting already ended`}}
      }

      // RESOLUTION

      const estimatePhase = getPhase(phases, 'ESTIMATE')
      let stages = estimatePhase.stages

      // delete stages
      const subtractiveUpdates = updates.filter((update) => {
        const {action, serviceTaskId} = update
        return (
          action === 'DELETE' && !!stages.find((stage) => stage.serviceTaskId === serviceTaskId)
        )
      })
      subtractiveUpdates.forEach((update) => {
        const {serviceTaskId} = update
        const stagesToRemove = stages.filter((stage) => stage.serviceTaskId === serviceTaskId)
        // since meeting.facilitatorStageId is mutated below, we want to use the updated value here
        const removingTatorStage = stagesToRemove.find(
          (stage) => stage.id === meeting.facilitatorStageId
        )
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
      const newDiscussions = [] as Insertable<Discussion>[]
      const additiveUpdates = updates.filter((update) => {
        const {action, serviceTaskId} = update
        return action === 'ADD' && !stages.find((stage) => stage.serviceTaskId === serviceTaskId)
      })

      const additiveUpdatesWithTaskIds = await importTasksForPoker(
        additiveUpdates,
        teamId,
        viewerId,
        meetingId
      )

      const newStageIds = [] as string[]
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
        const newIds = newStages.map(({id}) => id)
        newStageIds.push(...newIds)
      })

      if (stages.length > Threshold.MAX_POKER_STORIES * dimensions.length) {
        return {error: {message: 'Story limit reached'}}
      }

      const validatedFacilitatorStageRes = findStageById(phases, meeting.facilitatorStageId)
      if (!validatedFacilitatorStageRes) {
        Logger.error(
          `updatePokerScope attempted to set a bad facilitatorStageId: ${meeting.facilitatorStageId} for meeting ${meeting.id}`
        )
        // set to the first stage of last phase
        meeting.facilitatorStageId =
          phases.at(-1)?.stages.at(0)?.id ?? phases.at(1)!.stages.at(0)!.id
      }
      await pg
        .updateTable('NewMeeting')
        .set({
          facilitatorStageId: meeting.facilitatorStageId,
          phases: JSON.stringify(phases)
        })
        .where('id', '=', meetingId)
        .execute()
      if (newDiscussions.length > 0) {
        await getKysely().insertInto('Discussion').values(newDiscussions).execute()
      }
      dataLoader.clearAll(['newMeetings'])
      const data = {meetingId, newStageIds}
      publish(SubscriptionChannel.MEETING, meetingId, 'UpdatePokerScopeSuccess', data, subOptions)
      return data
    } finally {
      await redisLock.unlock()
    }
  }
}

export default updatePokerScope
