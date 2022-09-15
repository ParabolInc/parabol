import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import PollId from 'parabol-client/shared/gqlIds/PollId'
import PollOptionId from '../../../client/shared/gqlIds/PollOptionId'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Poll from './Poll'

const PollOption: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'PollOption',
  description: 'Poll options for a given poll',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Poll option id in a format of `pollOption:idGeneratedByDatabase`',
      resolve: ({id}) => PollOptionId.join(id)
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the item was created'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the item was updated'
    },
    pollId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The foreign key of the poll this option belongs to in a format of `poll:idGeneratedByDatabase`',
      resolve: ({pollId}) => PollId.join(pollId)
    },
    poll: {
      type: new GraphQLNonNull(Poll),
      description: 'The poll this option belongs to',
      resolve: ({pollId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('polls').load(pollId)
      }
    },
    voteUserIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'The ids of the users who voted for this option'
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Poll option title'
    }
  })
})

export default PollOption
