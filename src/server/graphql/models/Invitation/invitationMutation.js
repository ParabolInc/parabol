import r from '../../../database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {Invitee} from './invitationSchema';
import {errorObj} from '../utils';
import {requireSUOrTeamMember, getUserId} from '../authorization';

import {resolveSentEmails, makeInvitations, getTeamNameInvitedBy, sendInvitations} from './helpers';

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
      requireSUOrTeamMember(authToken, teamId);
      const userId = getUserId(authToken);

      // TODO on client: https://documentation.mailgun.com/api-email-validation.html#email-validation
      const {teamName, invitedBy} = await getTeamNameInvitedBy(teamId, userId);
      const invitations = makeInvitations(invitees, teamId);
      const sendEmailPromises = sendInvitations(invitedBy, teamName, invitations);
      const {inviteeErrors, invitationsToStore} = await resolveSentEmails(sendEmailPromises, invitees, invitations);
      // Bulk insert, wait in case something queries the invitation table
      await r.table('Invitation').insert(invitationsToStore);
      if (inviteeErrors) {
        throw errorObj({_error: 'Some invitations were not sent', failedEmails: inviteeErrors});
      }
      return true;
    }
  }
};
