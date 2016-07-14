import r from '../../../database/rethinkDriver';
import {TeamMember} from './teamMemberSchema';
import {
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {errorObj} from '../utils';
import {getUserId} from '../authorization';
import {validateTokenType} from '../../../utils/inviteTokens';

export default {
  acceptInvitation: {
    type: TeamMember,
    description: `Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the Team objective they've been
    added to. Returns null otherwise.

    Side effect: deletes all other outstanding invitations for user.`,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The invitation token'
      }
    },
    async resolve(source, {inviteToken}, {authToken}) {
      const validFormat = validateTokenType(inviteToken);
      if (!validFormat) {
        throw errorObj({
          _error: 'invitation token format is invalid',
          type: 'acceptInvitation',
          subtype: 'invalidToken'
        });
      }
      const userId = getUserId(authToken);
      const user = await r.table('CachedUser').get(userId);
      const invitation = await r.table('Invitation').get(inviteToken);
      if (!invitation) {
        throw errorObj({
          _error: 'unable to find invitation',
          type: 'acceptInvitation',
          subtype: 'notFound'
        });
      }
      // check inviteToken email
      if (invitation.email !== user.email) {
        throw errorObj({
          _error: 'invitation invalid for your email address',
          type: 'acceptInvitation',
          subtype: 'invalidEmail'
        });
      }
      // Check if TeamMember already exists (i.e. user invited themselves):
      const teamMemberExists = await r.table('TeamMember')
        .getAll(userId, {index: 'cachedUserId'})
        .filter({ teamId: invitation.teamId})
        .isEmpty()
        .not();
      if (teamMemberExists) {
        throw errorObj({
          _error: 'Cannot accept invitation, already a member of team.',
          type: 'acceptInvitation',
          subtype: 'alreadyJoined'
        });
      }
      // add user to TeamMembers
      const newTeamMember = {
        teamId: invitation.teamId,
        cachedUserId: userId,
        isActive: true,
        isLead: false,
        isFacilitator: false
      };
      const {id} = await r.table('TeamMember')
        .insert(newTeamMember, {returnChanges: true})
        /* return the single doc that was inserted: */
        .do((doc) => doc('changes').reduce((left) => left('new_val'))('new_val'))
        .pluck('id');
      if (!id) {
        throw errorObj({_error: 'unable to create new team membership', type: 'acceptInvitation'});
      }
      newTeamMember.id = id;
      /*
       * TODO: if other outstanding invitations, create actionable
       *       notifications in users notification center.
       */
      // delete other outstanding invitations for email
      await r.table('Invitation').getAll(user.email, {index: 'email'}).delete();

      return newTeamMember;
    }
  },
};
