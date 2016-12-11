import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Organization} from './organizationSchema';
import {requireSUOrSelf} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  organization: {
    type: new GraphQLList(Organization),
    args: {
      orgId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique org ID'
      }
    },
    async resolve(source, {orgId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      requireSUOrSelf(authToken, orgId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const now = new Date();
      r.table('Notifications')
        .getAll(orgId, {index: 'orgId'})
        .filter((row) => row('startAt').lt(r.epochTime(now / 1000)).and(row('endAt').gt(r.epochTime(now / 1000))))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
