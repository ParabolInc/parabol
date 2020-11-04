import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLList} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
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
    meetingId: {
      type: GraphQLID,
      description: 'The meetingId of the agenda item'
    },
    serviceTaskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stringified JSON used to fetch the task used by the service'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team for this agenda item'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the story was updated'
    }
  })
})

export default Story
