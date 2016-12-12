import getRethink from 'server/database/rethinkDriver';
import {GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Organization} from './organizationSchema';
import {requireAuth} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  organizations: {
    type: new GraphQLList(Organization),
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      const userId = requireAuth(authToken);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Organization')
        .getAll(userId, {index: 'billingLeaders'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
