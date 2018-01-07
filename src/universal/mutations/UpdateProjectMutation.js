import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getInProxy from 'universal/utils/relay/getInProxy';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';

graphql`
  fragment UpdateProjectMutation_project on UpdateProjectPayload {
    project {
      content
      sortOrder
      status
      tags
      teamMemberId
      updatedAt
      userId
      teamMember {
        id
        picture
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
  handleUpsertProjects(project);

  const addedNotification = payload.getLinkedRecord('addedNotification');
  handleAddNotifications(addedNotification, store, viewerId);
  if (options) {
    popInvolvementToast(payload, options);
  }

  const removedNotificationId = getInProxy(payload, 'removedNotification', 'id');
  handleRemoveNotifications(removedNotificationId);
};

const UpdateProjectMutation = (environment, updatedProject, area, onCompleted, onError) => {
  const {viewerId} = environment;
  // use this as a temporary fix until we get rid of cashay because otherwise relay will roll back the change
  // which means we'll have 2 items, then 1, then 2, then 1. i prefer 2, then 1.
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
