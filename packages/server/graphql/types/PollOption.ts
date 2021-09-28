import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PollOptionId from '../../../client/shared/gqlIds/PollOptionId'
import Poll from './Poll'
import PollId from 'parabol-client/shared/gqlIds/PollId'

const PollOption = new GraphQLObjectType<any, GQLContext>({
  name: 'PollOption',
  description: 'Poll options for a given poll',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Poll option id in a format of `pollOption:idGeneratedByDatabase`',
      resolve: ({id}) => PollOptionId.join(id)
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
      type: GraphQLNonNull(GraphQLID),
      description:
        'The foreign key of the poll this option belongs to in a format of `poll:idGeneratedByDatabase`',
      resolve: ({pollId}) => PollId.join(pollId)
    },
    poll: {
      type: GraphQLNonNull(Poll),
      description: 'The poll this option belongs to',
      resolve: ({pollId}, _args, {dataLoader}) => {
        return dataLoader.get('polls').load(pollId)
      }
    },
    voteUserIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'The ids of the users who voted for this option'
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Poll option title'
    }
  })
})

export default PollOption
