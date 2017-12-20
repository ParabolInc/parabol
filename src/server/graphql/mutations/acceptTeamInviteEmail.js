import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/mutations/helpers/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/mutations/helpers/inviteTeamMembers/validateInviteTokenKey';
import NotifyAddedToTeam from 'server/graphql/types/NotifyAddedToTeam';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';

export default {
  type: new GraphQLNonNull(NotifyAddedToTeam),
  description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user.`,
  args: {
    inviteToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
    }
  },
  async resolve(source, {inviteToken}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();

    // VALIDATION
    const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

    // see if the invitation exists
    const invitation = await r.table('Invitation').get(inviteId).update({
      tokenExpiration: new Date(0),
      updatedAt: now
    }, {returnChanges: true})('changes')(0)('old_val').default(null);

    if (!invitation) {
      throw new Error('notFound');
    }

    const {tokenExpiration, hashedToken, teamId, email} = invitation;
    // see if the invitation has expired
    if (tokenExpiration < now) {
      throw new Error('expiredInvitation');
    }

    // see if the invitation hash is valid
    const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
    if (!isCorrectToken) {
      throw new Error('invalidToken');
    }
    const oldtms = authToken.tms || [];
    // Check if TeamMember already exists (i.e. user invited themselves):
    const teamMemberExists = oldtms.includes(teamId);
    if (teamMemberExists) {
      throw new Error('alreadyJoined');
    }

    // RESOLUTION
    return acceptTeamInvite(teamId, authToken, email, {operationId, mutatorId: socketId});
  }
};

