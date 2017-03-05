import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from './getInviterInfoAndTeamName';
import createEmailPromises from './createEmailPromises';
import resolveSentEmails from './resolveSentEmails';
import makeInviteToken from './makeInviteToken';
import makeInvitationsForDB from './makeInvitationsForDB';

export default async function asyncInviteTeam(inviterUserId, teamId, invitees) {
  const r = getRethink();
  const inviteesWithTokens = invitees.map(invitee => ({...invitee, inviteToken: makeInviteToken()}));
  const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, inviterUserId);
  const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, inviterUserId);
  // Bulk insert, wait in case something queries the invitation table
  await r.table('Invitation').insert(invitationsForDB);
  return inviteesWithTokens;
  // TODO generate email to inviter including folks that we couldn't reach
  // if (inviteeErrors.length > 0) {
  // throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
  // }
};
