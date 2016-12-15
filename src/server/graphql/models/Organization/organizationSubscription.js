import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {getRequestedFields} from '../utils';
import {Organization} from './organizationSchema';
import {requireAuth, requireOrgLeader} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  organizations: {
    type: new GraphQLList(Organization),
    async resolve(source, args, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const billingLeaderOrgs = await r.table('User').get(userId)('billingLeaderOrgs');
      // Note: This is not reactive! If I am on this page & get added to a new org, I won't see it until I refresh
      r.table('Organization')
        .getAll(r.args(billingLeaderOrgs), {index: 'id'})
        // .merge((row) => ({
        //   memberCount: row('members').count()
        // }))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  organization: {
    type: Organization,
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the orgId'
      }
    },
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      await requireOrgLeader(authToken, orgId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Organization')
        .get(orgId)
        .changes({includeInitial: true})
        .map((row) => {
          return {
            new_val: row('new_val').pluck(requestedFields).default(null),
            old_val: row('old_val').pluck(requestedFields).default(null)
          };
        })
        .run({cursor: true}, changefeedHandler);
    }
  }
};
