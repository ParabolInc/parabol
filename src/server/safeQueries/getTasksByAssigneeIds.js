import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';
import ensureArray from 'universal/utils/ensureArray';

const getTasksByAssigneeId = async (maybeAssigneIds, dataLoader) => {
  const assigneeIds = ensureArray(maybeAssigneIds);
  const r = getRethink();
  const tasks = await r.table('Task')
    .getAll(r.args(assigneeIds), {index: 'assigneeId'});
  primeStandardLoader(dataLoader.get('tasks'), tasks);
  return tasks;
};

export default getTasksByAssigneeId;
