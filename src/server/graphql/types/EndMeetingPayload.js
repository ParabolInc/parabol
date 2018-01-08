import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import Team from 'server/graphql/types/Team';
import Project from 'server/graphql/types/Project';

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
    }
  })
});

export default EndMeetingPayload;
