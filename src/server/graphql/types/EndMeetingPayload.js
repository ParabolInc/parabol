import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveMeeting, resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import Project from 'server/graphql/types/Project';
import Meeting from 'server/graphql/types/Meeting';

const EndMeetingPayload = new GraphQLObjectType({
  name: 'EndMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    },
    archivedProjects: {
      type: new GraphQLList(Project),
      description: 'The list of projects that were archived during the meeting'
    },
    meeting: {
      type: Meeting,
      resolve: resolveMeeting
    }
  })
});

export default EndMeetingPayload;
