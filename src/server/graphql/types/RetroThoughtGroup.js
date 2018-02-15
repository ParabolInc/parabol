import {GraphQLInt, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import RetroThought from 'server/graphql/types/RetroThought';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';
import {isSuperUser} from 'server/utils/authorization';

const RetroThoughtGroup = new GraphQLObjectType({
  name: 'RetroThoughtGroup',
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
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective thoughts'
    },
    retroThoughts: {
      type: new GraphQLList(RetroThought),
      description: 'The thoughts that belong in the group',
      resolve: ({id: retroGroupId}, args, {dataLoader}) => {
        return dataLoader.get('retroThoughtsByGroupId').load(retroGroupId);
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
      description: 'The retrospective meeting this thought was cretaed in',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = dataLoader.get('newMeetings').load(meetingId);
        return dataLoader.get('teams').load(meeting.teamId);
      }
    },
    votes: {
      type: new GraphQLList(GraphQLID),
      description: 'A list of voterIds (teamMemberId or anonymousTeamMemberId). Not available to team to preserve anonymity',
      resolve: ({votes}, args, {authToken}) => {
        return isSuperUser(authToken) ? votes : undefined;
      }
    },
    voteCount: {
      type: GraphQLInt,
      description: 'The number of votes this group has received',
      resolve: ({votes}) => {
        return votes.length;
      }
    }
  })
});

export default RetroThoughtGroup;
