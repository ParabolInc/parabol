import {ACTIVE, STUCK, DONE, FUTURE, columnArray} from './constants';

// sorts post-split to be a little more efficient
export default function makeProjectsByStatus(projects) {
  const projectsByStatus = {
    [ACTIVE]: [],
    [STUCK]: [],
    [DONE]: [],
    [FUTURE]: []
  };
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    projectsByStatus[project.status].push(project);
  }

  // sort after for performance
  for (let i = 0; i < columnArray.length; i++) {
    const status = columnArray[i];
    projectsByStatus[status].sort((a, b) => b.sortOrder - a.sortOrder);
  }
  return projectsByStatus;
}
