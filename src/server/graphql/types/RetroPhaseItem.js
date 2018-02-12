import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import MeetingTask from 'server/graphql/types/MeetingTask';
import {resolveTeam} from 'server/graphql/resolvers';

const RetroPhaseItem = new GraphQLObjectType({
  name: 'RetroPhaseItem',
  description: 'A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    title: {
      type: GraphQLString,
      description: 'The title of the phase of the retrospective. Often a short version of the question'
    },
    question: {
      description: 'The question to answer during the phase of the retrospective (eg What went well?)',
      type: GraphQLString
    }
  })
});

export default RetroPhaseItem;
