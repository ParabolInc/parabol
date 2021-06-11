import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import resolveThreadableConnection from '../resolvers/resolveThreadableConnection'
import DiscussionTopicTypeEnum from './DiscussionTopicTypeEnum'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {ThreadableConnection} from './Threadable'

const Discussion = new GraphQLObjectType<any, GQLContext>({
  name: 'Discussion',
  description: 'A discussion thread',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    createdAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'time the thread was created'
    },
    discussionTopicId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The partial foreign key that references the object that is the topic of the discussion. E.g. AgendaItemId, TaskId, ReflectionGroupId'
    },
    discussionTopicType: {
      type: GraphQLNonNull(DiscussionTopicTypeEnum),
      description:
        'The partial foregin key that describes the type of object that is the topic of the discussion. E.g. AgendaItem, TaskId, ReflectionGroup, GitHubIssue'
    },
    commentCount: {
      type: GraphQLNonNull(GraphQLInt),
      description: 'The number of comments contained in the thread',
      resolve: async ({id: discussionId}, _args, {dataLoader}) => {
        return dataLoader.get('commentCountByDiscussionId').load(discussionId)
      }
    },
    thread: {
      type: GraphQLNonNull(ThreadableConnection),
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
      resolve: async ({id: discussionId}, _args, {dataLoader}) => {
        return resolveThreadableConnection(discussionId, {dataLoader})
      }
    }
  })
})

export default Discussion
