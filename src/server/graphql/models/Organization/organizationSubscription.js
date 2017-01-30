import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields'
import {Organization} from './organizationSchema';
import {requireSUOrSelf, requireOrgLeader} from 'server/utils/authorization';
import makeChangefeedHandler from '../../../utils/makeChangefeedHandler';

export default {
  organizations: {
    type: new GraphQLList(Organization),
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user ID that belongs to all the orgs'
      }
    },
    async resolve(source, {userId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, userId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      // Note: This is not reactive! If I am on this page & get added to a new org, I won't see it until I refresh
      r.table('Organization')
        .getAll(userId, {index: 'activeUsers'})
        .merge((row) => ({
          activeUserCount: row('activeUsers').count(),
          inactiveUserCount: row('inactiveUsers').count()
        }))
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
