import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';

const subscription = graphql`
  subscription ProjectCreatedSubscription($teamIds: [ID!]) {
    projectCreated(teamIds: $teamIds) {
      project {
        id
        agendaId
        content
        createdAt
        createdBy
        integration {
          service
          nameWithOwner
          issueNumber
        }
        sortOrder
        status
        tags
        teamMemberId
        updatedAt
        userId
        teamId
        team {
          id
          name
        }
        teamMember {
          id
          picture
          preferredName
        }
      }
    }
  }
`;

const ProjectCreatedSubscription = (environment, queryVariables, subParams) => {
  const {viewerId} = environment;
  const {operationName} = subParams;
  const {teamId} = queryVariables;
  // kinda hacky, but cleaner than creating a separate file
  const teamIds = operationName === 'UserDashRootQuery' ? null : [teamId];
  return {
    subscription,
    variables: {teamIds},
    updater: (store) => {
      const project = store.getRootField('projectCreated').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);
    }
  };
};

export default ProjectCreatedSubscription;
