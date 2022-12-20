import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {AGENDA_ITEMS, DISCUSS} from 'parabol-client/utils/constants'
import AgendaItemsPhase from '../../database/types/AgendaItemsPhase'
import DiscussPhase from '../../database/types/DiscussPhase'
import EstimatePhase from '../../database/types/EstimatePhase'
import TeamPromptResponsesPhase from '../../database/types/TeamPromptResponsesPhase'
import getRedis from '../../utils/getRedis'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import {augmentDBStage} from '../resolvers'
import resolveThreadableConnection from '../resolvers/resolveThreadableConnection'
import DiscussionTopicTypeEnum from './DiscussionTopicTypeEnum'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import NewMeetingStage from './NewMeetingStage'
import {ThreadableConnection} from './Threadable'
import User from './User'

const Discussion = new GraphQLObjectType<any, GQLContext>({
  name: 'Discussion',
  description: 'A discussion thread',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'time the thread was created'
    },
    discussionTopicId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The partial foreign key that references the object that is the topic of the discussion. E.g. AgendaItemId, TaskId, ReflectionGroupId'
    },
    discussionTopicType: {
      type: new GraphQLNonNull(DiscussionTopicTypeEnum),
      description:
        'The partial foregin key that describes the type of object that is the topic of the discussion. E.g. AgendaItem, TaskId, ReflectionGroup, GitHubIssue'
    },
    stage: {
      type: NewMeetingStage,
      description: 'The stage that the discussion is located',
      resolve: async (
        {discussionTopicId, discussionTopicType, meetingId},
        _args: unknown,
        {dataLoader}
      ) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases, teamId} = meeting
        switch (discussionTopicType) {
          case 'agendaItem': {
            const phase = phases.find((phase) => phase.phaseType === AGENDA_ITEMS) as
              | AgendaItemsPhase
              | undefined
            if (!phase) {
              return null
            }
            const {stages} = phase
            const dbStage = stages.find((stage) => stage.agendaItemId === discussionTopicId)

            return dbStage ? augmentDBStage(dbStage, meetingId, AGENDA_ITEMS, teamId) : null
          }
          case 'teamPromptResponse': {
            const phase = phases.find((phase) => phase.phaseType === 'RESPONSES') as
              | TeamPromptResponsesPhase
              | undefined
            if (!phase) {
              return null
            }
            const {stages} = phase
            const dbStage = stages.find((stage) => stage.teamMemberId === discussionTopicId)

            return dbStage ? augmentDBStage(dbStage, meetingId, 'RESPONSES', teamId) : null
          }
          case 'reflectionGroup': {
            const phase = phases.find((phase) => phase.phaseType === DISCUSS) as
              | DiscussPhase
              | undefined
            if (!phase) {
              return null
            }
            const {stages} = phase
            const dbStage = stages.find((stage) => stage.reflectionGroupId === discussionTopicId)

            return dbStage ? augmentDBStage(dbStage, meetingId, DISCUSS, teamId) : null
          }
          case 'task': {
            const phase = phases.find((phase) => phase.phaseType === 'ESTIMATE') as
              | EstimatePhase
              | undefined
            if (!phase) {
              return null
            }
            const {stages} = phase
            const dbStage = stages.find((stage) => stage.taskId === discussionTopicId)

            return dbStage ? augmentDBStage(dbStage, meetingId, 'ESTIMATE', teamId) : null
          }
        }

        return null
      }
    },
    commentCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of comments contained in the thread',
      resolve: async ({id: discussionId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('commentCountByDiscussionId').load(discussionId)
      }
    },
    commentors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      description: 'The users writing a comment right now',
      resolve: async ({id: discussionId}, _args: unknown, {dataLoader}) => {
        const redis = getRedis()
        const userIds = await redis.smembers(`commenting:${discussionId}`)
        if (userIds.length === 0) return []
        const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
        return users
      }
    },
    thread: {
      type: new GraphQLNonNull(ThreadableConnection),
      description: 'The comments & tasks thread in the discussion',
      args: {
        first: {
          type: GraphQLInt,
          description: 'How many items to show. optional if only comments are desired'
        },
        after: {
          type: GraphQLString,
          description: 'the incrementing sort order in string format'
        }
      },
      resolve: async (
        {id: discussionId}: {id: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return resolveThreadableConnection(discussionId, {dataLoader})
      }
    },
    summary: {
      type: GraphQLString,
      description: `The GPT-3 generated summary of the discussion. Undefined if the user doesnt have access to the feature or the stage isn't completed`
    }
  })
})

export default Discussion
