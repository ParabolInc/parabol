import getRethink from 'server/database/rethinkDriver';

export default async function rebalanceProject(status, teamId) {
  const r = getRethink();
  const tasks = await r.table('Project')
    .getAll(teamId, {index: 'teamId'})
    .orderBy('sortOrder')('id')
  const updates = tasks.map((id, idx) => ({id, idx}));
  await r.expr(updates)
    .forEach((update) => {
      return r.table('Action')
        .get(update('id'))
        .update({sortOrder: update('idx')});
    });
  return true;
}
