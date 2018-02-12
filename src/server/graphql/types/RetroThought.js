import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import MeetingTask from 'server/graphql/types/MeetingTask';
import {resolveTeam} from 'server/graphql/resolvers';

const RetroThought = new GraphQLObjectType({
  name: 'RetroThought',
  description: 'A team meeting history for all previous meetings',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    creatorId: {
      description: 'The teamMemberId that created the thought (or unique Id if not a team member)',
      type: GraphQLID
    },
    content: {
      description: 'The stringified draft-js content',
      type: GraphQLString
    },
    phase: {
      type: PhaseType
    }
  })
});

export default RetroThought;
