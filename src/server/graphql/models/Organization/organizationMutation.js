import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from './organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeader} from '../authorization';
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
    async resolve(source, {updatedOrg}, {authToken}) {
      const r = getRethink();

      // AUTH
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
  }
};
