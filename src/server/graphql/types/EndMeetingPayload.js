import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveMeeting, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import Task from 'server/graphql/types/Task';
import Meeting from 'server/graphql/types/Meeting';

const EndMeetingPayload = new GraphQLObjectType({
  name: 'EndMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    archivedTasks: {
      type: new GraphQLList(Task),
      description: 'The list of tasks that were archived during the meeting'
    },
    meeting: {
      type: Meeting,
      resolve: resolveMeeting
    }
  })
});

export default EndMeetingPayload;
