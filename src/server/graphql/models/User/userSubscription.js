import getRethink from 'server/database/rethinkDriver';
import {getRequestedFields} from '../utils';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {User} from './userSchema';
import makeChangefeedHandler from '../makeChangefeedHandler';
import {requireOrgLeader} from '../authorization';

export default {
  billingLeaders: {
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org the billing leaders are in charge of'
      }
    },
    type: new GraphQLList(User),
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      await requireOrgLeader(authToken, orgId);
      r.table('User')
        .getAll(orgId, {index: 'billingLeaderOrgs'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  usersByOrg: {
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org for which you want the users'
      }
    },
    type: new GraphQLList(User),
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      await requireOrgLeader(authToken, orgId);
      r.table('User')
        .getAll(orgId, {index: 'orgs'})
        .merge((row) => ({
          isBillingLeader: row('billingLeaderOrgs').default([]).contains(orgId)
        }))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  user: {
    type: User,
    async resolve(source, args, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const userId = authToken.sub;
      r.table('User')
        .get(userId)
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
