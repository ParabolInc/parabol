import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import parseInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/parseInviteToken';
import validateInviteTokenKey from 'server/graphql/models/Invitation/inviteTeamMembers/validateInviteTokenKey';
import removeTeamMember from 'server/graphql/models/TeamMember/removeTeamMember/removeTeamMember';
import acceptTeamInvite from 'server/safeMutations/acceptTeamInvite';
import {requireSUOrLead, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj, getOldVal} from 'server/utils/utils';

export default {
  checkIn: {
    type: GraphQLBoolean,
    description: 'Check a member in as present or absent',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamMemberId of the person who is being checked in'
      },
      isCheckedIn: {
        type: GraphQLBoolean,
        description: 'true if the member is present, false if absent, null if undecided'
      }
    },
    async resolve(source, {teamMemberId, isCheckedIn}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('TeamMember').get(teamMemberId).update({isCheckedIn});
    }
  },
  acceptInvitation: {
    type: GraphQLID,
    description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.

    Side effect: deletes all other outstanding invitations for user.`,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
      }
    },
    async resolve(source, {inviteToken}, {authToken}) {
      const r = getRethink();
      const now = new Date();

      // VALIDATION
      const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

      // see if the invitation exists
      const invitationRes = await r.table('Invitation').get(inviteId).update({
        tokenExpiration: new Date(0),
        updatedAt: now
      }, {returnChanges: true});
      const invitation = getOldVal(invitationRes);

      if (!invitation) {
        throw errorObj({
          _error: 'unable to find invitation',
          type: 'acceptInvitation',
          subtype: 'notFound'
        });
      }

      const {tokenExpiration, hashedToken, teamId, email} = invitation;
      // see if the invitation has expired
      if (tokenExpiration < now) {
        throw errorObj({
          _error: 'invitation has expired',
          type: 'acceptInvitation',
          subtype: 'expiredInvitation'
        });
      }

      // see if the invitation hash is valid
      const isCorrectToken = await validateInviteTokenKey(tokenKey, hashedToken);
      if (!isCorrectToken) {
        throw errorObj({
          _error: 'invalid invitation token',
          type: 'acceptInvitation',
          subtype: 'invalidToken'
        });
      }
      const oldtms = authToken.tms || [];
      // Check if TeamMember already exists (i.e. user invited themselves):
      const teamMemberExists = oldtms.includes(teamId);
      if (teamMemberExists) {
        throw errorObj({
          _error: 'Cannot accept invitation, already a member of team.',
          type: 'acceptInvitation',
          subtype: 'alreadyJoined'
        });
      }

      // RESOLUTION
      const addedToTeam = await acceptTeamInvite(teamId, authToken, email);
      return addedToTeam.authToken;
    }
  },
  removeTeamMember,
  promoteToLead: {
    type: GraphQLBoolean,
    description: 'Promote another team member to be the leader',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const [, teamId] = teamMemberId.split('::');
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrLead(authToken, myTeamMemberId);

      // VALIDATION
      const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId);
      if (!promoteeOnTeam) {
        throw errorObj({_error: `Member ${teamMemberId} is not on the team`});
      }

      // RESOLUTION
      await r.table('TeamMember')
      // remove leadership from the caller
        .get(myTeamMemberId)
        .update({
          isLead: false
        })
        // give leadership to the new person
        .do(() => {
          return r.table('TeamMember')
            .get(teamMemberId)
            .update({
              isLead: true
            });
        });
      return true;
    }
  },
  toggleAgendaList: {
    type: GraphQLBoolean,
    description: 'Show/hide the agenda list',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the new team member that will be the leader'
      }
    },
    async resolve(source, {teamId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      requireWebsocket(socket);
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      await requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      await r.table('TeamMember')
        .get(myTeamMemberId)
        .update((teamMember) => ({
          hideAgenda: teamMember('hideAgenda').default(false).not()
        }));
      return true;
    }
  }
};
