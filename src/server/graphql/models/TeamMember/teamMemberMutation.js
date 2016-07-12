import r from '../../../database/rethinkDriver';
import {TeamMember} from './teamMemberSchema';
import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql';
import {errorObj} from '../utils';
import {getUserId} from '../authorization';
import {validateInviteToken} from '../../../utils/inviteTokens';

export default {
  acceptInvitation: {
    type: TeamMember,
    description: `Add a user to a Team given an invitationToken.

If the invitationToken is valid, returns the Team objective they've been
added to. Returns null otherwise.

Side effect: deletes all other outstanding invitations for user.`,
    args: {
      inviteToken: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The invitation token'
      }
    },
    async resolve(source, {inviteToken}, {authToken}) {
      const {token, valid, error} = validateInviteToken(inviteToken);
      if (!valid) {
        throw errorObj({_error: error, type: 'acceptInvitation'});
      }
      const userId = getUserId(authToken);
      const user = await r.table('CachedUser').get(userId);
      const invitation = await r.table('Invitation').get(token.id);
      if (!invitation) {
        throw errorObj({_error: 'unable to find invitation', type: 'acceptInvitation'});
      }
      // check inviteToken email
      if (invitation.email !== user.email) {
        throw errorObj({_error: 'invitation invalid for your email address', type: 'acceptInvitation'});
      }
      // TODO: check if TeamMember already exists (i.e. user invited themselves:)
      // add user to TeamMembers
      const newTeamMember = {
        teamId: invitation.teamId,
        cachedUserId: userId,
        isActive: true,
        isLead: false,
        isFacilitator: false
      };
      const {changes: [{new_val: {id}}]} = await r.table('TeamMember')
        .insert(newTeamMember, {returnChanges: true});
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
