export default function makeAllProjects(teamOrMembers) {
  const projectIds = new Set();
  const allProjects = [];
  for (let i = 0; i < teamOrMembers.length; i++) {
    const {projects} = teamOrMembers[i];
    for (let j = 0; j < projects.length; j++) {
      const project = projects[j];
      if (!projectIds.has(project.id)) {
        projectIds.add(project.id);
        allProjects.push(projects[j]);
      }
    }
  }
  return allProjects;
}
