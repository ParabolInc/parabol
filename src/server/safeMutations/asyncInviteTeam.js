import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from '../graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import createEmailPromises from '../graphql/models/Invitation/inviteTeamMembers/createEmailPromises';
import resolveSentEmails from '../graphql/models/Invitation/inviteTeamMembers/resolveSentEmails';
import makeInviteToken from '../graphql/models/Invitation/inviteTeamMembers/makeInviteToken';
import makeInvitationsForDB from '../graphql/models/Invitation/inviteTeamMembers/makeInvitationsForDB';

export default async function asyncInviteTeam(inviterUserId, teamId, invitees) {
  if (invitees.length === 0) return invitees;
  const r = getRethink();
  const inviteesWithTokens = invitees.map((invitee) => ({...invitee, inviteToken: makeInviteToken()}));
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
