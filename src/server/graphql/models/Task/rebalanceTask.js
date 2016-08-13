import r from 'server/database/rethinkDriver';
import {STEP} from 'universal/utils/constants';

export default async function rebalanceTask(status, teamId) {
  const tasks = await r.table('Task')
    .getAll(teamId, {index: 'teamId'})
    .filter({type: 'PROJECT', status})
    .orderBy('sort')
    .pluck(['id', 'sort']);
  const updatedTasks = tasks.map((task, idx) => {
    return r.table('Task').get(task.id).update({sort: idx * STEP});
  });
  await Promise.all(updatedTasks);
  return true;
}
