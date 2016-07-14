import r from '../../../database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from './invitationSchema';
import {errorObj} from '../utils';
import {requireSUOrTeamMember, getUserId} from '../authorization';
import {makeToken} from '../../../utils/inviteTokens';

import {
  resolveSentEmails,
  makeInvitationsForDB,
  getInviterInfoAndTeamName,
  createEmailPromises,
} from './helpers';

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
      const inviteesWithTokens = invitees.map(invitee => ({...invitee, inviteToken: makeToken()}));
      const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
      const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens);
      const {inviteeErrors, inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
      const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId);
      // Bulk insert, wait in case something queries the invitation table
      await r.table('Invitation').insert(invitationsForDB);
      if (inviteeErrors.length > 0) {
        throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
      }
      return true;
    }
  }
};
