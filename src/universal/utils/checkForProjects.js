
const checkForProjects = (projects) => {
  // projects is an object that has arrays of projects for each status
  const statusesWithProjects = [];
  const projectsByStatus = Object.keys(projects);
  projectsByStatus.map((status) =>
    ((projects[status].length !== 0) && statusesWithProjects.push(status))
  );
  return Boolean(statusesWithProjects.length);
};

export default checkForProjects;
