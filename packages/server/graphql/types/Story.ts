import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import TeamMember from './TeamMember'
import ThreadSource, {threadSourceFields} from './ThreadSource'
import CommentorDetails from './CommentorDetails'

const Story = new GraphQLObjectType<any, GQLContext>({
  name: 'Story',
  description: 'A single story created in Sprint Poker',
  interfaces: () => [ThreadSource],
  fields: () => ({
    ...threadSourceFields(),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique story id teamId::shortid'
    },
    commentors: {
      type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
      description: 'A list of users currently commenting',
      resolve: ({commentors = []}) => {
        return commentors
      }
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The body of the story'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the story was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the story has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the story in the list'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team for this story'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId that created this story'
    },
    meetingId: {
      type: GraphQLID,
      description: 'The meetingId of the story'
    },
    serviceTaskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stringified JSON used to fetch the task used by the service'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the story was updated'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that created the story',
      resolve: async ({teamMemberId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

export default Story
