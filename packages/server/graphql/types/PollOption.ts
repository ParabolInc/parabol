import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Team from './Team'

const PollOption = new GraphQLObjectType<any, GQLContext>({
  name: 'PollOption',
  description: 'Poll options for a given poll',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the item was created'
    },
    updatedAt: {
      type: GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the item was updated'
    },
    pollId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the poll (indexed)'
    },
    poll: {
      type: new GraphQLNonNull(Team),
      description: 'The poll this option belongs to',
      resolve: ({pollId}, _args, {dataLoader}) => {
        return dataLoader.get('polls').load(pollId)
      }
    },
    voteUserIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The ids of the users who voted for this option'
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Poll option title'
    }
  })
})

export default PollOption
