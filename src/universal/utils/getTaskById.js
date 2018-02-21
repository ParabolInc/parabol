/**
 * Finds a Task from a paginated array of Tasks.
 *
 * @flow
 */

import type {Task, TaskID} from 'universal/types/task';

type PaginatedTasksArray = {
  edges: Array<{ node: Task }>
};

const getTaskById = (tasks: PaginatedTasksArray) => (taskId: TaskID): ?Task =>
  tasks.edges
    .map(({node}) => node)
    .find(({id}) => taskId === id);

export default getTaskById;
