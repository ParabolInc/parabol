import {commitMutation} from 'react-relay';
import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: ProjectInput!, $area: AreaEnum) {
    createProject(newProject: $newProject, area: $area) {
      project {
        id
        agendaId
        content
        createdAt
        createdBy
        editors {
          preferredName
          userId
        }
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

let tempId = 0;
const CreateProjectMutation = (environment, newProject, area, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {area, newProject},
    updater: (store) => {
      const project = store.getRootField('createProject').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);
    },
    optimisticUpdater: (store) => {
      const {teamMemberId} = newProject;
      const now = new Date().toJSON();
      const {userId, teamId} = fromTeamMemberId(teamMemberId);
      const teamMember = store.get(teamMemberId);
      const team = store.get(teamId);
      // TODO remove this when we move Teams to relay
      if (!team) {
        throw new Error('team not found', teamId);
      }
      const optimisticProject = {
        ...newProject,
        id: `${teamId}::$${tempId++}`,
        teamId,
        userId,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        tags: [],
        content: newProject.content || makeEmptyStr()
      };
      const project = createProxyRecord(store, 'Project', optimisticProject);
      project
        .setLinkedRecords([], 'editors')
        .setLinkedRecord(teamMember, 'teamMember')
        .setLinkedRecord(team, 'team');


      handleProjectConnections(store, viewerId, project);
    },
    onError,
    onCompleted
  });
};

export default CreateProjectMutation;
