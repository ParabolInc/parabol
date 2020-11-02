import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull
} from 'graphql'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TaskServiceEnum from './TaskServiceEnum'
import EstimateUserScore from './EstimateUserScore'
import getRedis from '../../utils/getRedis'
import db from '../../db'
import User from './User'

export const estimateStageFields = () => ({
  ...newMeetingStageFields(),
  service: {
    type: TaskServiceEnum,
    description: 'The service the task is connected to. If null, it is parabol'
  },
  serviceTaskId: {
    type: GraphQLNonNull(GraphQLID),
    description: 'The stringified JSON used to fetch the task used by the service'
  },
  sortOrder: {
    type: new GraphQLNonNull(GraphQLFloat),
    description: 'The sort order for reprioritizing discussion topics'
  },
  dimensionId: {
    type: GraphQLNonNull(GraphQLID),
    description: 'the dimensionId that corresponds to this stage'
  },
  finalScore: {
    type: GraphQLFloat,
    description: 'the final score, as defined by the facilitator'
  },
  hoveringUserIds: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
    description: 'the userIds of the team members hovering the deck',
    resolve: async ({id: stageId}) => {
      const redis = getRedis()
      const userIds = await redis.smembers(`pokerHover:${stageId}`)
      return userIds
    }
  },
  hoveringUsers: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(User))),
    description: 'the users of the team members hovering the deck',
    resolve: async ({id: stageId}) => {
      const redis = getRedis()
      const userIds = await redis.smembers(`pokerHover:${stageId}`)
      if (userIds.length === 0) return []
      const users = await db.readMany('User', userIds)
      return users
    }
  },
  scores: {
    type: GraphQLNonNull(GraphQLList(GraphQLNonNull(EstimateUserScore))),
    description: 'all the estimates, 1 per user',
    resolve: ({id: stageId, scores}) => {
      return scores.map((score) => ({
        ...score,
        stageId
      }))
    }
  },
  isVoting: {
    type: GraphQLNonNull(GraphQLBoolean),
    description:
      'true when the participants are still voting and results are hidden. false when votes are revealed'
  }
})

const EstimateStage = new GraphQLInterfaceType({
  name: 'EstimateStage',
  description: 'The stage where the team estimates & discusses a single task',
  interfaces: () => [NewMeetingStage],
  fields: () => ({
    ...estimateStageFields()
  })
})

export default EstimateStage
