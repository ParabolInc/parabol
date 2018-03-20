import {GraphQLInt, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLBoolean} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroReflection from 'server/graphql/types/RetroReflection';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import {isSuperUser} from 'server/utils/authorization';
import Team from 'server/graphql/types/Team';

const RetroReflectionGroup = new GraphQLObjectType({
  name: 'RetroReflectionGroup',
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
    isActive: {
      type: GraphQLBoolean,
      description: 'True if the reflection was not removed, else false'
    },
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective reflections'
    },
    retroReflections: {
      type: new GraphQLList(new GraphQLNonNull(RetroReflection)),
      description: 'The reflections that belong in the group',
      resolve: ({id: retroGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroReflectionsByGroupId').load(retroGroupId);
      }
    },
    meeting: {
      type: RetrospectiveMeeting,
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId);
      }
    },
    team: {
      type: Team,
      description: 'The team that is running the retro',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = dataLoader.get('newMeetings').load(meetingId);
        return dataLoader.get('teams').load(meeting.teamId);
      }
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was updated at'
    },
    voterIds: {
      type: new GraphQLList(GraphQLID),
      description: 'A list of voterIds (teamMemberId or anonymousTeamMemberId). Not available to team to preserve anonymity',
      resolve: ({votes}, args, {authToken}) => {
        return isSuperUser(authToken) ? votes : undefined;
      }
    },
    voteCount: {
      type: GraphQLInt,
      description: 'The number of votes this group has received',
      resolve: ({voterIds}) => {
        return voterIds ? voterIds.length : 0;
      }
    }
  })
});

export default RetroReflectionGroup;
