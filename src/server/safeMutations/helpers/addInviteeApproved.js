import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {INVITEE_APPROVED} from 'universal/utils/constants';

const addInviteeApproved = async (inviteeEmail, inviter) => {
  const r = getRethink();
  const now = new Date();
  const {inviterName, userId, teamId, teamName, orgId} = inviter;
  const notification = {
    id: shortid.generate(),
    type: INVITEE_APPROVED,
    startAt: now,
    orgId,
    userIds: [userId],
    inviteeEmail,
    inviterName,
    teamId,
    teamName
  };
  await r.table('Notification').insert(notification);
  return {[userId]: [notification]};
};

export default addInviteeApproved;
