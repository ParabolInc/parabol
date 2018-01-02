import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateOrgInput from 'server/graphql/types/UpdateOrgInput';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {handleSchemaErrors} from 'server/utils/utils';
import {ORGANIZATION, UPDATED} from 'universal/utils/constants';
import updateOrgValidation from './helpers/updateOrgValidation';

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  description: 'Update an with a change in name, avatar',
  args: {
    updatedOrg: {
      type: new GraphQLNonNull(UpdateOrgInput),
      description: 'the updated org including the id, and at least one other field'
    }
  },
  async resolve(source, {updatedOrg}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

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
    await r.table('Organization')
      .get(orgId)
      .update(dbUpdate);
    publish(ORGANIZATION, orgId, UPDATED, {orgId}, subOptions);
    return {orgId};
  }
};
