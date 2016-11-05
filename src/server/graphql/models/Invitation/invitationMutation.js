import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from './invitationSchema';
import {requireSUOrTeamMember} from '../authorization';

import {asyncInviteTeam} from './helpers';

export default {
  inviteTeamMembers: {
    type: GraphQLBoolean,
    description: 'Send invitation emails to a list of email addresses, add them to the invitation table',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting team'
      },
      invitees: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
      }
    },
    async resolve(source, {invitees, teamId}, {authToken}) {
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      // don't let them invite the same person twice
      const emails = invitees.map(invitee => invitee.email);
      const existingInvitations = await r.table('Invitation').getAll(r.args(emails), {index: 'email'})('email');
      const uniqueInvitees = invitees.filter((i) => !existingInvitations.includes(i.email));
      if (uniqueInvitees.length === 0) return false;
      asyncInviteTeam(authToken, teamId, uniqueInvitees);
      return true;
    }
  }
};
