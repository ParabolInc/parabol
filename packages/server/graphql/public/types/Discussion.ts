import {AGENDA_ITEMS, DISCUSS} from 'parabol-client/utils/constants'
import getRedis from '../../../utils/getRedis'
import isValid from '../../isValid'
import {
  isAgendaItemsPhase,
  isDiscussPhase,
  isEstimatePhase,
  isTeamPromptResponsesPhase
} from '../../meetingTypePredicates'
import {augmentDBStage} from '../../resolvers'
import resolveThreadableConnection from '../../resolvers/resolveThreadableConnection'
import {DiscussionResolvers} from '../resolverTypes'

const Discussion: DiscussionResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  stage: async ({discussionTopicId, discussionTopicType, meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const {phases, teamId} = meeting
    switch (discussionTopicType) {
      case 'agendaItem': {
        const phase = phases.find(isAgendaItemsPhase)
        if (!phase) {
          return null
        }
        const {stages} = phase
        const dbStage = stages.find((stage) => stage.agendaItemId === discussionTopicId)

        return dbStage ? augmentDBStage(dbStage, meetingId, AGENDA_ITEMS, teamId) : null
      }
      case 'teamPromptResponse': {
        const phase = phases.find(isTeamPromptResponsesPhase)
        if (!phase) {
          return null
        }
        const {stages} = phase
        const dbStage = stages.find((stage) => stage.teamMemberId === discussionTopicId)

        return dbStage ? augmentDBStage(dbStage, meetingId, 'RESPONSES', teamId) : null
      }
      case 'reflectionGroup': {
        const phase = phases.find(isDiscussPhase)
        if (!phase) {
          return null
        }
        const {stages} = phase
        const dbStage = stages.find(
          (stage) => 'reflectionGroupId' in stage && stage.reflectionGroupId === discussionTopicId
        )

        return dbStage ? augmentDBStage(dbStage, meetingId, DISCUSS, teamId) : null
      }
      case 'task': {
        const phase = phases.find(isEstimatePhase)
        if (!phase) {
          return null
        }
        const {stages} = phase
        const dbStage = stages.find(
          (stage) => 'taskId' in stage && stage.taskId === discussionTopicId
        )

        return dbStage ? augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId) : null
      }
    }

    return null
  },

  commentCount: async ({id: discussionId}, _args, {dataLoader}) => {
    return dataLoader.get('commentCountByDiscussionId').load(discussionId)
  },

  commentors: async ({id: discussionId}, _args, {dataLoader}) => {
    const redis = getRedis()
    const userIds = await redis.smembers(`commenting:${discussionId}`)
    if (userIds.length === 0) return []
    const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
    return users
  },

  thread: async ({id: discussionId}, _args, {dataLoader}) => {
    return resolveThreadableConnection(discussionId, {dataLoader})
  }
}

export default Discussion
