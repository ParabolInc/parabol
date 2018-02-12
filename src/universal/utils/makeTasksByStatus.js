import {ACTIVE, STUCK, DONE, FUTURE, columnArray} from './constants';

// sorts post-split to be a little more efficient
export default function makeTasksByStatus(tasks) {
  const tasksByStatus = {
    [ACTIVE]: [],
    [STUCK]: [],
    [DONE]: [],
    [FUTURE]: []
  };
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    tasksByStatus[task.status].push(task);
  }

  // sort after for performance
  for (let i = 0; i < columnArray.length; i++) {
    const status = columnArray[i];
    tasksByStatus[status].sort((a, b) => b.sortOrder - a.sortOrder);
  }
  return tasksByStatus;
}
