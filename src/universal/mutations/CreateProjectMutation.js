import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleEditProject from 'universal/mutations/handlers/handleEditProject';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr';
import clientTempId from 'universal/utils/relay/clientTempId';
import createProxyRecord from 'universal/utils/relay/createProxyRecord';
import getOptimisticProjectEditor from 'universal/utils/relay/getOptimisticProjectEditor';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';


graphql`
  fragment CreateProjectMutation_project on CreateProjectPayload {
    project {
      ...CompleteProjectFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment CreateProjectMutation_notification on CreateProjectPayload {
    involvementNotification {
      id
      changeAuthor {
        preferredName
      }
      involvement
      team {
        id
        name
      }
      project {
        content
        status
        tags
        teamMember {
          picture
          preferredName
        }
      }
    }
  }
`;

const mutation = graphql`
  mutation CreateProjectMutation($newProject: CreateProjectInput!, $area: AreaEnum) {
    createProject(newProject: $newProject, area: $area) {
      ...CreateProjectMutation_project @relay(mask: false)
    }
  }
`;

export const createProjectProjectUpdater = (payload, store, viewerId, isEditing) => {
  const project = payload.getLinkedRecord('project');
  if (!project) return;
  const projectId = project.getValue('id');
  const userId = project.getValue('userId');
  const editorPayload = getOptimisticProjectEditor(store, userId, projectId, isEditing);
  handleEditProject(editorPayload, store);
  handleUpsertProjects(project, store, viewerId);
};

export const createProjectNotificationUpdater = (payload, store, viewerId, options) => {
  const notification = payload.getLinkedRecord('involvementNotification');
  if (!notification) return;
  handleAddNotifications(notification, store, viewerId);

  // No need to pass options for the mutation because you can't notify yourself of your involvement
  if (options) {
    popInvolvementToast(notification, options);
  }
};

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
      const payload = store.getRootField('createProject');
      createProjectProjectUpdater(payload, store, viewerId, isEditing);
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
