import getRethink from 'server/database/rethinkDriver';
import {GraphQLList, GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import Project from './projectSchema';
import {errorObj} from 'server/utils/utils';
import {requireAuth, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';

export default {
  getArchivedProjects: {
    type: new GraphQLList(Project),
    description: 'A paginated query for all the archived projects for a team',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team ID for the desired team'
      },
      first: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'the number of documents to fetch'
      },
      after: {
        type: GraphQLID,
        description: 'The pagination cursor'
      }
    },
    resolve(source, {teamId, first, after}, {authToken, socket}) {
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      const cursor = after || r.minval;
      return r.table('Project')
        .between([teamId, cursor], [teamId, r.maxval], {index: 'teamIdCreatedAt', leftBound: 'open'})
        .filter((project) => project('tags').contains('archived'))
        .limit(first)
        .run();
    }
  },
  getCurrentProject: {
    type: Project,
    description: 'Given an auth token, return the user and auth token',
    async resolve(source, args, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const user = await r.table('Project').get(userId);
      if (!user) {
        throw errorObj({_error: 'Project ID not found'});
      }
      return user;
    }
  }
};
