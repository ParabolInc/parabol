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

import {
  makeInviteToken,
  resolveSentEmails,
  makeInvitationsForDB,
  getInviterInfoAndMeetingName,
  createEmailPromises,
} from './helpers';

export default {
  inviteTeamMembers: {
    type: GraphQLBoolean,
    description: 'Send invitation emails to a list of email addresses, add them to the invitation table',
    args: {
      meetingId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting meeting'
      },
      invitees: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
      }
    },
    async resolve(source, {invitees, meetingId}, {authToken}) {
      await requireSUOrTeamMember(authToken, meetingId);
      const userId = getUserId(authToken);
      const inviteesWithTokens = invitees.map(invitee => ({...invitee, inviteToken: makeInviteToken()}));
      const inviterInfoAndTeamName = await getInviterInfoAndMeetingName(meetingId, userId);
      const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens);
      const {inviteeErrors, inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
      const invitationsForDB = await makeInvitationsForDB(inviteesToStore, meetingId);
      // Bulk insert, wait in case something queries the invitation table
      await r.table('Invitation').insert(invitationsForDB);
      if (inviteeErrors.length > 0) {
        throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
      }
      return true;
    }
  }
};
