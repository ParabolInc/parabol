import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getInProxy from 'universal/utils/relay/getInProxy';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';

graphql`
  fragment UpdateProjectMutation_project on UpdateProjectPayload {
    project {
      # Entire frag needed in case it is deprivatized
      ...CompleteProjectFrag @relay(mask:false)
      editors {
        userId
        preferredName
      }
    }
    addedNotification {
      type
      ...ProjectInvolves_notification @relay(mask: false)
    }
    removedNotification {
      id
    }
    privatizedProjectId
  }
`;

const mutation = graphql`
  mutation UpdateProjectMutation($updatedProject: UpdateProjectInput!) {
    updateProject(updatedProject: $updatedProject) {
      ...UpdateProjectMutation_project @relay (mask: false)
    }
  }
`;

export const updateProjectProjectUpdater = (payload, store, viewerId, options) => {
  const project = payload.getLinkedRecord('project');
  handleUpsertProjects(project, store, viewerId);

  const addedNotification = payload.getLinkedRecord('addedNotification');
  handleAddNotifications(addedNotification, store, viewerId);
  if (options) {
    popInvolvementToast(addedNotification, options);
  }

  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(removedNotificationId);

  const privatizedProjectId = payload.getValue('privatizedProjectId');
  const projectUserId = getInProxy(project, 'userId');
  if (projectUserId !== viewerId && privatizedProjectId) {
    handleRemoveProjects(privatizedProjectId, store, viewerId);
  }
};

const UpdateProjectMutation = (environment, updatedProject, area, onCompleted, onError) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {
      area,
      updatedProject
    },
    updater: (store) => {
      const payload = store.getRootField('updateProject');
      updateProjectProjectUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const {id, content, userId} = updatedProject;
      const project = store.get(id);
      if (!project) return;
      const now = new Date();
      const optimisticProject = {
        ...updatedProject,
        updatedAt: now.toJSON()
      };
      updateProxyRecord(project, optimisticProject);
      if (userId) {
        const teamMemberId = toTeamMemberId(project.getValue('teamId'), userId);
        project.setValue(teamMemberId, 'teamMemberId');
        const teamMember = store.get(teamMemberId);
        if (teamMember) {
          project.setLinkedRecord(teamMember, 'teamMember');
        }
      }
      if (content) {
        const {entityMap} = JSON.parse(content);
        const nextTags = getTagsFromEntityMap(entityMap);
        project.setValue(nextTags, 'tags');
      }
      handleUpsertProjects(project, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default UpdateProjectMutation;
