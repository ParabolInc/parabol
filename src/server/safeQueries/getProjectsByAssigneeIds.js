import getRethink from 'server/database/rethinkDriver';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';
import ensureArray from 'universal/utils/ensureArray';

const getProjectsByAssigneeId = async (maybeAssigneIds, dataLoader) => {
  const assigneeIds = ensureArray(maybeAssigneIds);
  const r = getRethink();
  const projects = await r.table('Project')
    .getAll(r.args(assigneeIds), {index: 'assigneeId'});
  primeStandardLoader(dataLoader.get('projects'), projects);
  return projects;
};

export default getProjectsByAssigneeId;
