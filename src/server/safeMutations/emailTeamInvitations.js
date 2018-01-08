import getRethink from 'server/database/rethinkDriver';
import createEmailPromises from 'server/graphql/models/Invitation/inviteTeamMembers/createEmailPromises';
import makeInvitationsForDB from 'server/graphql/models/Invitation/inviteTeamMembers/makeInvitationsForDB';
import makeInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/makeInviteToken';
import resolveSentEmails from 'server/graphql/models/Invitation/inviteTeamMembers/resolveSentEmails';
import getPendingInvitations from 'server/safeQueries/getPendingInvitations';

export default async function emailTeamInvitations(invitees, inviter, inviteId) {
  if (invitees.length === 0) return {newInvitations: [], updatedInvitations: []};
  const {teamId, userId: inviterUserId} = inviter;
  const r = getRethink();
  const now = new Date();
  const inviteesWithTokens = invitees.map((invitee) => ({...invitee, inviteToken: makeInviteToken(inviteId)}));
  const sendEmailPromises = createEmailPromises(inviter, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, inviterUserId);
  const emails = invitees.map(({email}) => email);
  const invitationsInDB = await getPendingInvitations(emails, teamId);
  const updatedInvitations = invitationsInDB.map((invitationInDB) => {
    const newInvite = invitationsForDB.find((invite) => invite.email === invitationInDB.email);
    return {
      ...invitationInDB,
      hashedToken: newInvite.hashedToken,
      inviteCount: invitationInDB.inviteCount + 1,
      tokenExpiration: newInvite.tokenExpiration,
      updatedAt: now
    };
  });
  await Promise.all(updatedInvitations.map((updatedInvite) => {
    return r.table('Invitation').get(updatedInvite.id).replace(updatedInvite);
  }));
  const currentInviteEmails = updatedInvitations.map(({email}) => email);
  const newInvitationDocs = invitationsForDB.filter((invite) => !currentInviteEmails.includes(invite.email));
  const newInvitations = await r.table('Invitation')
    .insert(newInvitationDocs, {returnChanges: true})('changes')('new_val').default([]);
  return {newInvitations, updatedInvitations};
}
