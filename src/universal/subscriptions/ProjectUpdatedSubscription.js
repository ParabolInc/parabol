import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';
import {handleEditingFromPayload} from 'universal/mutations/EditProjectMutation';

const subscription = graphql`
  subscription ProjectUpdatedSubscription($teamIds: [ID!]) {
    projectUpdated(teamIds: $teamIds) {
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
      editor {
        projectId
        editing
        user {
          userId: id
          preferredName
        }
      }
    }
  }
`;

const ProjectUpdatedSubscription = (environment, queryVariables, subParams) => {
  const {viewerId} = environment;
  const {operationName} = subParams;
  const {teamId} = queryVariables;
  // kinda hacky, but cleaner than creating a separate file
  const teamIds = operationName === 'UserDashRootQuery' ? null : [teamId];
  return {
    subscription,
    variables: {teamIds},
    updater: (store) => {
      const payload = store.getRootField('projectUpdated');
      const project = payload.getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);

      const editor = payload.getLinkedRecord('editor');
      handleEditingFromPayload(store, editor);
    }
  };
};

export default ProjectUpdatedSubscription;
