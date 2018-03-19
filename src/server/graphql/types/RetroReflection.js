import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import {getUserId, isSuperUser} from 'server/utils/authorization';

const RetroReflection = new GraphQLObjectType({
  name: 'RetroReflection',
  description: 'A reflection created during the reflect phase of a retrospective',
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
      description: 'The userId that created the reflection (or unique Id if not a team member)',
      type: GraphQLID,
      resolve: ({creatorId}, args, {authToken}) => {
        return isSuperUser(authToken) ? creatorId : undefined;
      }
    },
    isViewerCreator: {
      description: 'true if the viewer (userId) is the creator of the retro reflection, else false',
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
      description: 'The foreign key to link a reflection to its meeting'
    },
    retroPhaseItemId: {
      type: GraphQLID,
      description: 'The foreign key to link a reflection to its phaseItem'
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'The foreign key to link a reflection to its group'
    },
    retroReflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The group the reflection belongs to, if any',
      resolve: async ({reflectionGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughGroups').load(reflectionGroupId);
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
      description: 'The retrospective meeting this reflection was cretaed in',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId);
      }
    },
    team: {
      type: RetrospectiveMeeting,
      description: 'The team that is running the meeting that contains this reflection',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = dataLoader.get('newMeetings').load(meetingId);
        return dataLoader.get('teams').load(meeting.teamId);
      }
    }
  })
});

export default RetroReflection;
