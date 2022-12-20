import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import getRedis from '../../utils/getRedis'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import resolveThreadableConnection from '../resolvers/resolveThreadableConnection'
import DiscussionTopicTypeEnum from './DiscussionTopicTypeEnum'
import GraphQLISO8601Type from './GraphQLISO8601Type'
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
