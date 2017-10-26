import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateOrgInput from 'server/graphql/types/UpdateOrgInput';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import updateOrgValidation from './helpers/updateOrgValidation';
import {ORGANIZATION_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  description: 'Update an with a change in name, avatar',
  args: {
    updatedOrg: {
      type: new GraphQLNonNull(UpdateOrgInput),
      description: 'the updated org including the id, and at least one other field'
    }
  },
  async resolve(source, {updatedOrg}, {authToken, socketId}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
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
    const organization = await r.table('Organization')
      .get(orgId)
      .update(dbUpdate, {returnChanges: true})('changes')(0)('new_val');
    const organizationUpdated = {organization};
    getPubSub().publish(`${ORGANIZATION_UPDATED}.${orgId}`, {organizationUpdated, mutatorId: socketId});
    return organizationUpdated;
  }
};
