import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {Organization} from './organizationSchema';
import {getUserId, getUserOrgDoc, requireSUOrSelf, requireOrgLeader} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';
import {BILLING_LEADER} from 'universal/utils/constants';

const getCounts = (org) => {
  return org('orgUsers')
    .filter({inactive: true})
    .count()
    .default(0)
    .do((inactiveUserCount) => {
      return {
        activeUserCount: org('orgUsers').count().sub(inactiveUserCount),
        inactiveUserCount,
      };
    });
};

export default {
  ownedOrganizations: {
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
      await requireSUOrSelf(authToken, userId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .filter((org) => org('orgUsers')
          .contains((orgUser) => orgUser('id').eq(userId).and(orgUser('role').eq(BILLING_LEADER))))
        .merge(getCounts)
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

      // AUTH
      const userId = getUserId(authToken);
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Organization')
        .get(orgId)
        .changes({includeInitial: true})
        .map((row) => {
          return {
            new_val: row('new_val')
              .merge(getCounts)
              .pluck(requestedFields)
              .default(null),
            old_val: row('old_val')
              .merge(getCounts)
              .pluck(requestedFields)
              .default(null)
          };
        })
        .run({cursor: true}, changefeedHandler);
    }
  },
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
      r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
};
