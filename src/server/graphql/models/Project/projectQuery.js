import r from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {Project} from './projectSchema';
import {errorObj} from '../utils';
import {requireAuth, requireSUOrTeamMember} from '../authorization';

export default {
  getArchivedProjects: {
    type: Project,
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
    async resolve(source, {teamId, first, after}, {authToken}) {
      requireSUOrTeamMember(authToken, teamId);
      const cursor = after || r.minval;
      return await r.table('Project')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: false})
        .between(cursor, r.maxval, {index: 'createdAt', leftBound: 'open'})
        .limit(first);
    }
  },
  getCurrentProject: {
    type: Project,
    description: 'Given an auth token, return the user and auth token',
    async resolve(source, args, {authToken}) {
      const userId = requireAuth(authToken);
      const user = await r.table('Project').get(userId);
      if (!user) {
        throw errorObj({_error: 'Project ID not found'});
      }
      return user;
    }
  }
};
