import getRethink from 'server/database/rethinkDriver';
import createEmailPromises from '../graphql/models/Invitation/inviteTeamMembers/createEmailPromises';
import makeInvitationsForDB from '../graphql/models/Invitation/inviteTeamMembers/makeInvitationsForDB';
import makeInviteToken from '../graphql/models/Invitation/inviteTeamMembers/makeInviteToken';
import resolveSentEmails from '../graphql/models/Invitation/inviteTeamMembers/resolveSentEmails';

export default async function emailTeamInvitations(invitees, inviter) {
  if (invitees.length === 0) return invitees;
  const {teamId, userId: inviterUserId} = inviter;
  const r = getRethink();
  const inviteesWithTokens = invitees.map((invitee) => ({...invitee, inviteToken: makeInviteToken()}));
  const sendEmailPromises = createEmailPromises(inviter, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, inviterUserId);
  // Bulk insert, wait in case something queries the invitation table
  return r.table('Invitation').insert(invitationsForDB);
  // TODO generate email to inviter including folks that we couldn't reach
  // if (inviteeErrors.length > 0) {
  // throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
  // }
};
