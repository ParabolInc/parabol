import {adjustArchive} from 'universal/mutations/UpdateProjectMutation';

const subscription = graphql`
  subscription ProjectUpdatedSubscription($teamId: ID!) {
    projectUpdated(teamId: $teamId) {
      project {
        id
        content
        createdAt
        integration {
          service
          nameWithOwner
          issueNumber
        }
        status
        tags
        teamMemberId
        updatedAt
        teamMember {
          id
          picture
          preferredName
        }
      }
    }
  }
`;

const ProjectUpdatedSubscription = (environment, queryVariables) => {
  const {viewerId} = environment;
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamIds: [teamId]},
    updater: (store) => {
      const project = store.getRootField('projectUpdated').getLinkedRecord('project');
      adjustArchive(store, viewerId, project, teamId);
    }
  };
};

export default ProjectUpdatedSubscription;
