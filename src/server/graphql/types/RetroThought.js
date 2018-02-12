import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingInvitee from 'server/graphql/types/MeetingInvitee';
import MeetingTask from 'server/graphql/types/MeetingTask';
import {resolveTeam} from 'server/graphql/resolvers';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';

const RetroThought = new GraphQLObjectType({
  name: 'RetroThought',
  description: 'A thought created during the think phase of a retrospective',
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
    retroThoughtGroup: {
      type: RetroThoughtGroup,
      description: 'The group the thought belongs to, if any',
      resolve: ({retroGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughtGroup').load(retroGroupId);
      }
    },
    phase: {
      type: RetroPhaseItem,
      resolve: ({retroPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('retroPhaseItem').load(retroPhaseItemId);
      }
    }
  })
});

export default RetroThought;
