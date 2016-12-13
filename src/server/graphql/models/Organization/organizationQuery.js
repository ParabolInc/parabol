import getRethink from 'server/database/rethinkDriver';
import {GraphQLList, GraphQLNonNull, GraphQLID} from 'graphql';
import {Organization} from './organizationSchema';
import {requireAuth} from '../authorization';

export default {
  getOrgCount: {
    type: new GraphQLList(Organization),
    async resolve(source, args, {authToken}) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const users = await r.table('Organization')
        .getAll(userId, {index: 'billingLeaders'})('id')
        .coerceTo('array')
        .do((orgIds) => {
          return r.table('Team')
            .getAll(r.args(orgIds), {index: 'orgId'})('id')
            .coerceTo('array')
        })
        .do((teamIds) => {
          return r.table('TeamMember')
            .getAll(r.args(teamIds), {index: 'teamId'})('userId')
            .coerceTo('array')
            .distinct()
        })
        .do((userIds) => {
          return r.table('User')
            .getAll(r.args(userIds), {index: 'id'})
            .pluck('id', 'isActive')
        });
      const activeCount = users.filter((user) => user.isActive).length;
      const inactiveCount = users.length - activeCount;
      return {
        activeCount,
        inactiveCount
      };
    }
  }
};
