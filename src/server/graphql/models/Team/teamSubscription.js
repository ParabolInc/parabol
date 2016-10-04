import r from 'server/database/rethinkDriver';
import {GraphQLList} from 'graphql';
import {errorObj, getRequestedFields} from '../utils';
import {Team} from './teamSchema';
import {requireAuth} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  teams: {
    type: new GraphQLList(Team),
    async resolve(source, args, {authToken, socket, subbedChannelName}, refs) {
      requireAuth(authToken);
      const {tms} = authToken;
      if (!tms || tms.length === 0) {
        throw errorObj({_error: 'You are not a part of any teams'});
      }
      // TODO update subscription on the client when a new team gets added. So rare, it's OK to resend all 3-4 docs
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r().table('Team')
        .getAll(...tms)
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
