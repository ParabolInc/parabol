import {commitMutation} from 'react-relay';
import {handleProjectConnections} from 'universal/mutations/UpdateProjectMutation';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: CreateProjectInput!, $area: AreaEnum) {
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
    variables: {
      area,
      newProject
    },
    updater: (store) => {
      const project = store.getRootField('createProject').getLinkedRecord('project');
      handleProjectConnections(store, viewerId, project);
    },
    optimisticUpdater: (store) => {
      const {teamId, userId} = newProject;
      const teamMemberId = toTeamMemberId(teamId, userId);
      const now = new Date().toJSON();
      const optimisticProject = {
        ...newProject,
        id: `${teamId}::$${tempId++}`,
        teamId,
        userId,
        createdAt: now,
        createdBy: userId,
        updatedAt: now,
        tags: [],
        teamMemberId,
        content: newProject.content || makeEmptyStr()
      };
      const project = createProxyRecord(store, 'Project', optimisticProject)
        .setLinkedRecords([], 'editors')
        .setLinkedRecord(store.get(teamMemberId), 'teamMember')
        .setLinkedRecord(store.get(teamId), 'team');


      handleProjectConnections(store, viewerId, project);
    },
    onError,
    onCompleted
  });
};

export default CreateProjectMutation;
