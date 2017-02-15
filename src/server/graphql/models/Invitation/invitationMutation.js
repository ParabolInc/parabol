import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import makeInviteToken from './inviteTeamMembers/makeInviteToken';
import getInviterInfoAndTeamName from './inviteTeamMembers/getInviterInfoAndTeamName';
import createEmailPromises from './inviteTeamMembers/createEmailPromises';
import resolveSentEmails from './inviteTeamMembers/resolveSentEmails';
import hashInviteTokenKey from './inviteTeamMembers/hashInviteTokenKey';
import resendInvite from './inviteTeamMembers/resendInvite';
import {INVITATION_LIFESPAN} from 'server/utils/serverConstants';
import inviteTeamMembers from 'server/graphql/models/Invitation/inviteTeamMembers/inviteTeamMembers';

export default {
  inviteTeamMembers,
  cancelInvite: {
    type: GraphQLBoolean,
    description: 'Cancel an invitation',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the invitation'
      },
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
  },
  resendInvite: {
    type: GraphQLBoolean,
    description: 'Cancel an invitation',
    args: {
      inviteId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the invitation'
      },
    },
    async resolve(source, {inviteId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const invitation = await r.table('Invitation').get(inviteId);
      const {email, fullName, teamId} = invitation;
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const inviteToken = makeInviteToken();
      const inviteeWithToken = {
        email,
        fullName,
        inviteToken
      };
      const userId = getUserId(authToken);
      const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
      const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, [inviteeWithToken]);
      await resolveSentEmails(sendEmailPromises, [inviteeWithToken]);
      const now = new Date();
      const hashedToken = await hashInviteTokenKey(inviteToken);
      const invitedBy = `${userId}::${teamId}`;
      const tokenExpiration = new Date(now + INVITATION_LIFESPAN);
      await r.table('Invitation').get(inviteId).update({
        hashedToken,
        invitedBy,
        inviteToken,
        inviteCount: r.row('inviteCount').add(1),
        tokenExpiration,
        updatedAt: now
      });
      await resendInvite(authToken, inviteId);
      return true;
    }
  }
};
