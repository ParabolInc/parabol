import {PENDING} from 'server/utils/serverConstants';

exports.up = async (r) => {
  const now = new Date();
  await r.table('OrgApproval').update({
    updatedAt: now,
    status: PENDING
  })
};

exports.down = async () => {
  await r.table('OrgApproval').replace((row) => {
    return row.without('updatedAt', 'status');
  });
};
