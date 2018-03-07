import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import RetroThoughtGroup from 'server/graphql/types/RetroThoughtGroup';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import {getUserId, isSuperUser} from 'server/utils/authorization';

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
      description: 'The userId that created the thought (or unique Id if not a team member)',
      type: GraphQLID,
      resolve: ({creatorId}, args, {authToken}) => {
        return isSuperUser(authToken) ? creatorId : undefined;
      }
    },
    isViewerCreator: {
      description: 'true if the viewer (userId) is the creator of the retro thought, else false',
      type: GraphQLBoolean,
      resolve: ({creatorId}, args, {authToken}) => {
        const viewerId = getUserId(authToken);
        return viewerId === creatorId;
      }
    },
    content: {
      description: 'The stringified draft-js content',
      type: GraphQLString
    },
    meetingId: {
      type: GraphQLID,
      description: 'The foreign key to link a thought to its meeting'
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The foreign key to link a thought to its phaseItem'
    },
    thoughtGroupId: {
      type: GraphQLID,
      description: 'The foreign key to link a thought to its group'
    },
    retroThoughtGroup: {
      type: RetroThoughtGroup,
      description: 'The group the thought belongs to, if any',
      resolve: async ({thoughtGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughGroups').load(thoughtGroupId);
      }
    },
    phase: {
      type: RetroPhaseItem,
      resolve: ({retroPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(retroPhaseItemId);
      }
    },
    meeting: {
      type: RetrospectiveMeeting,
      description: 'The retrospective meeting this thought was cretaed in',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId);
      }
    },
    team: {
      type: RetrospectiveMeeting,
      description: 'The team that is running the meeting that contains this thought',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = dataLoader.get('newMeetings').load(meetingId);
        return dataLoader.get('teams').load(meeting.teamId);
      }
    }
  })
});

export default RetroThought;
