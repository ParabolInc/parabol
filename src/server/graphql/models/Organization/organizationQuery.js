import getRethink from 'server/database/rethinkDriver';
import {GraphQLList, GraphQLNonNull, GraphQLID} from 'graphql';
import {Organization} from './organizationSchema';
import {requireAuth} from '../authorization';

export default {
  getOrgCount: {
    type: new GraphQLList(Organization),
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The organization ID'
      }
    },
    async resolve(source, {orgId}, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const users = await r.table('Team')
        .getAll(orgId, {index: 'orgId'})('id')
        .coerceTo('array')
        .do((teamId) => {
          return r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})('userId')
            .coerceTo('array')
            .distinct()
        })
        .do((userIds) => {
          return r.table('User')
            .getAll(r.args(userIds), {index: 'id'})
            .pluck('id', 'isActive')
        });
      const activeCount = users.filter((user) => user.isActive).length;
      const inactiveCount= users.length - activeCount;
      return {
        activeCount,
        inactiveCount
      };
    }
  }
};
