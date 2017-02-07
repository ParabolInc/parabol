import getRethink from 'server/database/rethinkDriver';
import {getUserId} from 'server/utils/authorization';
import getInviterInfoAndTeamName from './getInviterInfoAndTeamName';
import createEmailPromises from './createEmailPromises';
import resolveSentEmails from './resolveSentEmails';
import makeInviteToken from './makeInviteToken';
import makeInvitationsForDB from './makeInvitationsForDB';

export default async function asyncInviteTeam (authToken, teamId, invitees) {
  const r = getRethink();
  const userId = getUserId(authToken);
  const inviteesWithTokens = invitees.map(invitee => ({...invitee, inviteToken: makeInviteToken()}));
  const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
  const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, userId);
  // Bulk insert, wait in case something queries the invitation table
  await r.table('Invitation').insert(invitationsForDB);
  return true;
  // TODO generate email to inviter including folks that we couldn't reach
  // if (inviteeErrors.length > 0) {
  // throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
  // }
};
