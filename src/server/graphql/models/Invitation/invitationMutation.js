import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';

export default {
  cancelInvite: {
    type: GraphQLBoolean,
    description: 'Cancel an invitation',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the invitation'
      }
    },
    async resolve(source, {inviteId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const invite = await r.table('Invitation').get(inviteId);
      const {acceptedAt, teamId, tokenExpiration} = invite;
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const now = new Date();
      if (acceptedAt) {
        throw errorObj({type: 'alreadyAccepted'});
      } else if (tokenExpiration < now) {
        throw errorObj({type: 'alreadyExpired'});
      }

      // RESOLUTION
      await r.table('Invitation').get(inviteId).update({
        // set expiration to epoch so it gets removed from the changefeed
        tokenExpiration: new Date(0),
        updatedAt: now
      });
      return true;
    }
  }
};
