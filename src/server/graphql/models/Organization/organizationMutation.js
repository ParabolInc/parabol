import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from './organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeader, requireWebsocket} from '../authorization';
import updateOrgSchema from 'universal/validation/updateOrgSchema';
import {handleSchemaErrors} from '../utils';

export default {
  updateOrg: {
    type: GraphQLBoolean,
    description: 'Update an with a change in name, avatar',
    args: {
      updatedOrg: {
        type: new GraphQLNonNull(UpdateOrgInput),
        description: 'the updated org including the id, and at least one other field'
      }
    },
    async resolve(source, {updatedOrg}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, updatedOrg.id);

      // VALIDATION
      const schema = updateOrgSchema();
      const {errors, data: {id: orgId, ...org}} = schema(updatedOrg);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const newAction = {
        ...org,
        updatedAt: now
      };
      await r.table('Organization').get(orgId).update(newAction);
      return true;
    }
  },
  removeBillingLeader: {
    type: GraphQLBoolean,
    description: 'Remove a billing leader from an org',
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the org to remove the billing leader from'
      },
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The billing leader userId to remove from the org'
      }
    },
    async resolve(source, {orgId, userId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      await requireOrgLeader(authToken, orgId);

      // RESOLUTION
      const now = new Date();
      await r.table('User').get(orgId)
        .update((user) => {
          return user.merge({
            billingLeaderOrgs: user('billingLeaderOrgs').filter((id) => id.ne(orgId)),
            updatedAt: now
          });
        });
      return true;
    }
  }
};
