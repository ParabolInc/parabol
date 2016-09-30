import {ACTIVE, STUCK, DONE, FUTURE, columnArray} from './constants';

// sorts post-split to be a little more efficient
export default function makeProjectsByStatus(projects, sortOrder) {
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

  for (let i = 0; i < columnArray.length; i++) {
    const status = columnArray[i];
    projectsByStatus[status].sort((a, b) => a[sortOrder] < b[sortOrder]);
  }
  return projectsByStatus;
}
