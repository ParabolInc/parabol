import {commitMutation} from 'react-relay';
import handleEditProject from 'universal/mutations/handlers/handleEditProject';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getOptimisticProjectEditor from 'universal/utils/relay/getOptimisticProjectEditor';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const mutation = graphql`
  mutation CreateProjectMutation($newProject: CreateProjectInput!, $area: AreaEnum) {
    createProject(newProject: $newProject, area: $area) {
      project {
        ...CompleteProjectFrag @relay(mask: false)
      }
    }
  }
`;

const CreateProjectMutation = (environment, newProject, area, onError, onCompleted) => {
  const {viewerId} = environment;
  const isEditing = !newProject.content;
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      newProject
    },
    updater: (store) => {
      const project = store.getRootField('createProject').getLinkedRecord('project');
      const projectId = project.getValue('id');
      const userId = project.getValue('userId');
      const editorPayload = getOptimisticProjectEditor(store, userId, projectId, isEditing);
      handleEditProject(editorPayload, store);
      handleUpsertProjects(project, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {teamId, userId} = newProject;
      const teamMemberId = toTeamMemberId(teamId, userId);
      const now = new Date().toJSON();
      const projectId = clientTempId(teamId);
      const optimisticProject = {
        ...newProject,
        id: projectId,
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
        .setLinkedRecord(store.get(teamMemberId), 'teamMember')
        .setLinkedRecord(store.get(teamId), 'team');
      const editorPayload = getOptimisticProjectEditor(store, userId, projectId, isEditing);
      handleEditProject(editorPayload, store);
      handleUpsertProjects(project, store, viewerId);
    },
    onError,
    onCompleted
  });
};

export default CreateProjectMutation;
