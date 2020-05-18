import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import TeamMember from './TeamMember'
import {IAgendaItem} from 'parabol-client/types/graphql'

const AgendaItem = new GraphQLObjectType<IAgendaItem, GQLContext>({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique agenda item id teamId::shortid'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The body of the agenda item'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the agenda item has not been processed or deleted',
      resolve: ({isActive}) => !!isActive
    },
    pinned: {
      type: new GraphQLNonNull(GraphQLBoolean),
      // type: GraphQLBoolean,
      description: 'True if the agenda item has been pinned'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the agenda item in the list'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: '*The team for this agenda item'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId that created this agenda item'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was updated'
    },
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that created the agenda item',
      resolve: async ({teamMemberId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(teamMemberId)
      }
    }
  })
})

export default AgendaItem
