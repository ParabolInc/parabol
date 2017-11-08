import {removeFromProjectConnections} from 'universal/mutations/DeleteProjectMutation';

const subscription = graphql`
  subscription ProjectDeletedSubscription($teamIds: [ID!]) {
    projectDeleted(teamIds: $teamIds) {
      project {
        id
        teamId
      }
    }
  }
`;

const ProjectDeletedSubscription = (environment, queryVariables, subParams) => {
  const {viewerId} = environment;
  const {operationName} = subParams;
  // kinda hacky, but cleaner than creating a separate file
  const variables = operationName === 'UserDashRootQuery' ? {} : {teamIds: [queryVariables.teamId]};
  return {
    subscription,
    variables,
    updater: (store) => {
      const project = store.getRootField('projectDeleted').getLinkedRecord('project');
      const projectId = project.getValue('id');
      const teamId = project.getValue('teamId');
      removeFromProjectConnections(store, viewerId, projectId, teamId);
    }
  };
};

export default ProjectDeletedSubscription;
