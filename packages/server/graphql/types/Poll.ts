import {GQLContext} from './../graphql'
import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
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
      type: new GraphQLNonNull(User),
      description: 'The user that created the item',
      resolve: ({createdById}: {createdById: string}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('users').load(createdById)
      }
    },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Poll id in a format of `poll:idGeneratedByDatabase`',
      resolve: ({id}) => PollId.join(id)
    },
    meetingId: {
      type: GraphQLID,
      description: 'The foreign key for the meeting the poll was created in'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team (indexed)'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team this poll belongs to',
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Poll title'
    },
    options: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PollOption))),
      description: 'A list of all the poll options related to this poll',
      resolve: async ({id: pollId}, _args, {dataLoader}) => {
        return dataLoader.get('pollOptions').load(pollId)
      }
    }
  })
})

export default Poll
