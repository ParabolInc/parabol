import {GraphQLBoolean, GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import TeamMember from 'server/graphql/types/TeamMember';

const AgendaItem = new GraphQLObjectType({
  name: 'AgendaItem',
  description: 'A request placeholder that will likely turn into 1 or more tasks',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique agenda item id teamId::shortid'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The body of the agenda item'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was created'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'true until the agenda item has been marked isComplete and the meeting has ended'
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'true if the agenda item has been addressed in a meeting (will have a strikethrough or similar)'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'The sort order of the agenda item in the list'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: '*The team for this agenda item'},
    teamMemberId: {type: new GraphQLNonNull(GraphQLID), description: 'The teamMemberId that created this agenda item'},
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the agenda item was updated'
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member that created the agenda item',
      resolve: async ({teamMemberId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(teamMemberId);
      }
    }
  })
});

export default AgendaItem;
