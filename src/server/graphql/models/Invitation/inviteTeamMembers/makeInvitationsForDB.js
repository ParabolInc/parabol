import {INVITATION_LIFESPAN} from 'server/utils/serverConstants';
import parseInviteToken from './parseInviteToken';
import hashInviteTokenKey from './hashInviteTokenKey';

export default async function makeInvitationsForDB(invitees, teamId, userId) {
  const now = new Date();
  const invitedBy = `${userId}::${teamId}`;
  const tokenExpiration = new Date(now.valueOf() + INVITATION_LIFESPAN);
  const hashPromises = invitees.map(invitee => hashInviteTokenKey(invitee.inviteToken));
  const hashedTokens = await Promise.all(hashPromises);
  return invitees.map((invitee, idx) => {
    const {email, inviteToken, task, fullName} = invitee;
    const {id} = parseInviteToken(inviteToken);
    return {
      id,
      invitedBy,
      inviteCount: 1,
      createdAt: now,
      email,
      fullName,
      hashedToken: hashedTokens[idx],
      task,
      teamId,
      tokenExpiration,
      updatedAt: now
    };
  });
};
