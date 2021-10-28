import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import Team from './Team'
import Threadable, {threadableFields} from './Threadable'
import PollOption from './PollOption'
import User from './User'
import PollId from '../../../client/shared/gqlIds/PollId'

const Poll = new GraphQLObjectType<any, GQLContext>({
  name: 'Poll',
  description: 'A poll created during the meeting',
  interfaces: () => [Threadable],
  isTypeOf: ({title}) => !!title,
  fields: () => ({
    ...(threadableFields() as any),
    createdByUser: {
      type: GraphQLNonNull(User),
      description: 'The user that created the item',
      resolve: ({createdById}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdById)
      }
    },
    id: {
      type: GraphQLNonNull(GraphQLID),
      description: 'Poll id in a format of `poll:idGeneratedByDatabase`',
      resolve: ({id}) => PollId.join(id)
    },
    meetingId: {
      type: GraphQLID,
      description: 'The foreign key for the meeting the poll was created in'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The id of the team (indexed)'
    },
    team: {
      type: GraphQLNonNull(Team),
      description: 'The team this poll belongs to',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    title: {
      type: GraphQLNonNull(GraphQLString),
      description: 'Poll title'
    },
    options: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(PollOption))),
      description: 'A list of all the poll options related to this poll',
      resolve: async ({id: pollId}, _args, {dataLoader}) => {
        return dataLoader.get('pollOptions').load(pollId)
      }
    }
  })
})

export default Poll
