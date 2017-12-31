import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/validateInviteTokenKey';
import AcceptTeamInvitePayload from 'server/graphql/types/AcceptTeamInvitePayload';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

export default {
  type: new GraphQLNonNull(AcceptTeamInvitePayload),
  description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user.`,
  args: {
    inviteToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
    }
  },
  async resolve(source, {inviteToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();

    // AUTH
    requireAuth(authToken);

    // VALIDATION
    const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

    // see if the invitation exists
    const invitation = await r.table('Invitation').get(inviteId).update({
      tokenExpiration: new Date(0),
      updatedAt: now
    }, {returnChanges: true})('changes')(0)('old_val').default(null);

    if (!invitation) {
      return {
        error: {
          title: 'Invitation not found, but don’t worry',
          message: `
              Hey we couldn’t find that invitation. If you’d like to
              create your own team, you can start that process here.
            `
        }
      };
    }

    const {tokenExpiration, hashedToken, teamId, email} = invitation;
    // see if the invitation has expired
    if (tokenExpiration < now) {
      return {
        error: {
          title: 'Invitation has expired',
          message: `
              Hey, your invitation expired. Maybe someone already used it or
              it was sitting in your inbox too long.
              Ask your friend for a new one.
            `
        }
      };
    }

    // see if the invitation hash is valid
    const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
    if (!isCorrectToken) {
      return {
        error: {
          title: 'Invitation invalid',
          message: `
              We had difficulty with that link. Did you paste it correctly?
            `
        }
      };
    }
    const oldtms = authToken.tms || [];
    // Check if TeamMember already exists (i.e. user invited themselves):
    const teamMemberExists = oldtms.includes(teamId);
    if (teamMemberExists) {
      return {
        error: {
          title: 'Team already joined',
          message: `
              Hey, we think you already belong to this team.
            `
        }
      };
    }

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const {removedNotification, newAuthToken} = acceptTeamInvite(teamId, authToken, email, {operationId, mutatorId});
    return {
      teamId,
      teamMemberId: toTeamMemberId(teamId, viewerId),
      removedNotification,
      authToken: newAuthToken
    };
  }
};

