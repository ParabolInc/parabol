/**
 * Finds a Project from a paginated array of Projects.
 *
 * @flow
 */

import type { Project, ProjectID } from 'universal/types/project';

type PaginatedProjectsArray = {
  edges: Array<{ node: Project }>
};

const getProjectById = (projects: PaginatedProjectsArray) => (projectId: ProjectID): ?Project =>
  projects.edges
    .map(({ node }) => node)
    .find(({ id }) => projectId === id);

export default getProjectById;
