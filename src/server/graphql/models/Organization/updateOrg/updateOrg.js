import getRethink from 'server/database/rethinkDriver';
import {UpdateOrgInput} from '../organizationSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import {
  getUserId,
  getUserOrgDoc,
  requireOrgLeader,
  requireWebsocket
} from 'server/utils/authorization';
import updateOrgValidation from './updateOrgValidation';
import {handleSchemaErrors} from 'server/utils/utils';

export default {
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
    const now = new Date();

    // AUTH
    requireWebsocket(socket);
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, updatedOrg.id);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const schema = updateOrgValidation();
    const {errors, data: {id: orgId, ...org}} = schema(updatedOrg);
    handleSchemaErrors(errors);

    // RESOLUTION
    const dbUpdate = {
      ...org,
      updatedAt: now
    };
    await r.table('Organization').get(orgId).update(dbUpdate);
    return true;
  }
};
