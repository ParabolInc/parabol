import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {INVITATION_LIFESPAN} from 'server/utils/serverConstants';
import createEmailPromises from './createEmailPromises';
import getInviterInfoAndTeamName from './getInviterInfoAndTeamName';
import resolveSentEmails from './resolveSentEmails';
import makeInviteToken from './makeInviteToken';
import hashInviteTokenKey from './hashInviteTokenKey';

export default async function resendInvite(authToken, inviteId) {
  const r = getRethink();
  const invitation = await r.table('Invitation').get(inviteId);
  const {email, fullName, teamId} = invitation;
  requireSUOrTeamMember(authToken, teamId);
  const inviteToken = makeInviteToken();
  const inviteeWithToken = {
    email,
    fullName,
    inviteToken
  };
  const userId = getUserId(authToken);
  const inviterInfoAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
  const sendEmailPromises = createEmailPromises(inviterInfoAndTeamName, [inviteeWithToken]);
  await resolveSentEmails(sendEmailPromises, [inviteeWithToken]);
  const now = new Date();
  const hashedToken = await hashInviteTokenKey(inviteToken);
  const invitedBy = `${userId}::${teamId}`;
  const tokenExpiration = new Date(now.valueOf() + INVITATION_LIFESPAN);
  await r.table('Invitation').get(inviteId).update({
    hashedToken,
    invitedBy,
    inviteToken,
    inviteCount: r.row('inviteCount').add(1),
    tokenExpiration,
    updatedAt: now
  });
};
