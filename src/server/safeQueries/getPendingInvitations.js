import getRethink from 'server/database/rethinkDriver';

const getPendingInvitations = (emailArr, teamId) => {
  const r = getRethink();
  const now = new Date();
  return r.table('Invitation')
    .getAll(r.args(emailArr), {index: 'email'})
    .filter({teamId})
    .filter((invitation) => invitation('tokenExpiration').ge(now));
};

export default getPendingInvitations;
