import getRethink from 'server/database/rethinkDriver';
import {SORT_STEP} from 'universal/utils/constants';

export default async function rebalanceProject(status, teamId) {
  const r = getRethink();
  const tasks = await r.table('Project')
    .getAll(teamId, {index: 'teamId'})
    .orderBy('sort')
    .pluck(['id', 'sort']);
  const updatedProjects = tasks.map((task, idx) => {
    return r.table('Task').get(task.id).update({sort: idx * SORT_STEP});
  });
  await Promise.all(updatedProjects);
  return true;
}
