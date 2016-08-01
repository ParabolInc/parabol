import r from 'server/database/rethinkDriver';
import {TeamMember} from './teamMemberSchema';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import {errorObj} from '../utils';
import {getUserId, requireWebsocket, requireSUOrTeamMember} from '../authorization';
import shortid from 'shortid';
import acceptInviteDB from './helpers';
import {parseInviteToken, validateInviteTokenKey} from '../Invitation/helpers';


export default {
  checkin: {
    type: GraphQLBoolean,
    description: 'Check a member in as present or absent',
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamMemberId of the person who is being checked in'
      },
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The teamId to make sure the socket calling has permission'
      },
      isCheckedIn: {
        type: GraphQLBoolean,
        description: 'true if the member is present, false if absent, null if undecided'
      }
    },
    async resolve(source, {teamId, teamMemberId, isCheckedIn}, {authToken, socket}) {
      await requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);
      await r.table('TeamMember').get(teamMemberId).update({isCheckedIn});
    }
  },
  acceptInvitation: {
    type: TeamMember,
    description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the Team objective they've been
    added to. Returns null otherwise.

    Side effect: deletes all other outstanding invitations for user.`,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
      }
    },
    async resolve(source, {inviteToken}, {authToken}) {
      const now = new Date();
      const {id: inviteId, key: tokenKey} = parseInviteToken(inviteToken);

      // see if the invitation exists
      const invitation = await r.table('Invitation').get(inviteId);
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

      const userId = getUserId(authToken);
      const user = await r.table('User').get(userId);

      // Check if TeamMember already exists (i.e. user invited themselves):
      const teamMemberExists = await r.table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .filter({teamId: teamId})
        .isEmpty()
        .not();
      if (teamMemberExists) {
        throw errorObj({
          _error: 'Cannot accept invitation, already a member of team.',
          type: 'acceptInvitation',
          subtype: 'alreadyJoined'
        });
      }

      const usersOnTeam = await r.table('TeamMember').getAll(teamId, {index: 'teamId'}).count();

      // add user to TeamMembers
      const newTeamMember = {
        checkInOrder: usersOnTeam + 1,
        id: shortid.generate(),
        teamId: teamId,
        userId,
        isActive: true,
        isLead: false,
        isFacilitator: false,
        picture: user.picture,
        preferredName: user.preferredName,
      };
      await r.table('TeamMember').insert(newTeamMember);

      /*
       * TODO: if other outstanding invitations, create actionable
       *       notifications in users notification center.
       */

      // mark invitation as accepted
      await acceptInviteDB(email, now);

      // if user created an account with a different email, flag those oustanding invites, too
      if (user.email !== email) {
        await acceptInviteDB(user.email, now);
      }
      return newTeamMember;
    }
  }
};
