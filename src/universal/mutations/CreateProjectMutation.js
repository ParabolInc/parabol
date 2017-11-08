import {commitMutation} from 'react-relay';
import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: ProjectInput!) {
    createProject(newProject: $newProject) {
      project {
        id
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

const CreateProjectMutation = (environment, newProject, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {newProject},
    updater: (store) => {
      const project = store.getRootField('createProject').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);
    },
    optimisticUpdater: (store) => {
      const now = new Date().toJSON();
      const [userId, teamId] = newProject.teamMemberId.split('::');
      const globalTeamMemberId = toGlobalId('TeamMember', newProject.teamMemberId);
      // const globalTeamId = toGlobalId('Team', teamId);
      const teamMember = store.get(globalTeamMemberId);
      const team = store.get(teamId);
      // TODO remove this when we move Teams to relay
      if (!team) {
        throw new Error('team not found', teamId);
      }
      const optimisticProject = {
        ...newProject,
        teamId,
        userId,
        createdAt: now,
        updatedAt: now,
        tags: [],
        content: newProject.content || makeEmptyStr()
      };
      const project = createProxyRecord(store, 'Project', optimisticProject);
      project
        .setLinkedRecord(teamMember, 'teamMember')
        .setLinkedRecord(team, 'team');


      handleProjectConnections(store, viewerId, project);
    },
    onError,
    onCompleted
  });
};

export default CreateProjectMutation;
