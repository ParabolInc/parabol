import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import RetroThoughtGroup from 'server/graphql/types/RetroThoughtGroup';

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
      resolve: async ({id: meetingId, thoughtGroupId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId);
        return meeting.thoughtGroups.find(({id}) => id === thoughtGroupId);
      }
    },
    phase: {
      type: RetroPhaseItem,
      resolve: async ({id: meetingId, retroPhaseItemId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId);
        return meeting.phases.find(({id}) => id === retroPhaseItemId);
      }
    }
  })
});

export default RetroThought;
