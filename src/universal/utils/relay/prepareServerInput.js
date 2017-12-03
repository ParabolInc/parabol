import prepareServerId from 'universal/utils/relay/prepareServerId';

const prepareServerInput = (project, foreignKeys) => {
  const nextProject = {...project};
  foreignKeys.forEach((idField) => {
    if (project.hasOwnProperty(idField)) {
      nextProject[idField] = prepareServerId(project[idField]);
    }
  });
  return nextProject;
};

export default prepareServerInput;
