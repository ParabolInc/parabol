import {GraphQLError} from 'graphql'
import {SprintPokerDefaults} from '../../../../client/types/constEnums'
import {getServerIntegration} from '../../../integrations/platform/registry'
import type {EstimateStage as EstimateStageDB} from '../../../postgres/types/NewMeetingPhase'
import {getUserId} from '../../../utils/authorization'
import getRedis from '../../../utils/getRedis'
import isValid from '../../isValid'
import {resolveStoryFinalScore} from '../../resolvers/resolveStoryFinalScore'
import type {EstimateStageResolvers} from '../resolverTypes'

export interface EstimateStageSource extends EstimateStageDB {
  meetingId: string
  teamId: string
}

const EstimateStage: EstimateStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'ESTIMATE',
  serviceField: async ({dimensionRefIdx, meetingId, teamId, taskId}, _args, context, info) => {
    const {dataLoader, authToken} = context
    const viewerId = getUserId(authToken)
    const NULL_FIELD = {
      __typename: 'ServiceField' as const,
      name: SprintPokerDefaults.SERVICE_FIELD_NULL,
      type: 'string'
    }
    const task = await dataLoader.get('tasks').load(taskId)
    const integration = task?.integration
    if (!task || !integration) return NULL_FIELD
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'poker') throw new Error('Meeting is not a poker meeting')
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(meeting.templateRefId)
    const {name: dimensionName} = templateRef.dimensions[dimensionRefIdx]!
    const {estimatePush} = getServerIntegration(integration.service).capabilities
    const field = await estimatePush.resolveServiceField({
      dataLoader,
      teamId,
      userId: integration.accessUserId,
      context,
      info,
      task,
      dimensionName,
      viewerId
    })
    return field ? {__typename: 'ServiceField' as const, ...field} : NULL_FIELD
  },

  dimensionRef: async ({meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'poker') throw new GraphQLError('Not a poker meeting')
    const {templateRefId} = meeting
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    const {dimensions} = templateRef
    const {name, scaleRefId} = dimensions[dimensionRefIdx]!
    return {
      name,
      scaleRefId,
      dimensionRefIdx,
      meetingId
    }
  },

  finalScore: async ({taskId, meetingId, dimensionRefIdx}, _args, {dataLoader}) => {
    return resolveStoryFinalScore(taskId, meetingId, dimensionRefIdx, dataLoader)
  },

  hoveringUserIds: async ({id: stageId}) => {
    const redis = getRedis()
    const userIds = await redis.smembers(`pokerHover:${stageId}`)
    return userIds
  },

  hoveringUsers: async ({id: stageId}, _args, {dataLoader}) => {
    const redis = getRedis()
    const userIds = await redis.smembers(`pokerHover:${stageId}`)
    if (userIds.length === 0) return []
    return (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
  },

  scores: ({id: stageId, scores}) => {
    return scores.map((score) => ({
      ...score,
      stageId
    }))
  },

  task: async ({taskId}, _args, {dataLoader}) => {
    const task = await dataLoader.get('tasks').load(taskId)
    return task ?? null
  }
}

export default EstimateStage
