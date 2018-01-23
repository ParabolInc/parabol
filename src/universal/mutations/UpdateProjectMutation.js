// @flow
import type {
  Environment,
  RecordProxy,
  RecordSourceSelectorProxy
} from 'relay-runtime';
import type {
  UpdateProjectMutationResponse,
  UpdateProjectMutationVariables
} from './__generated__/UpdateProjectMutation.graphql';
import type {UserID} from 'universal/types/user';

import {commitMutation, graphql} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import popInvolvementToast from 'universal/mutations/toasts/popInvolvementToast';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import getInProxy from 'universal/utils/relay/getInProxy';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';

export type {UpdateProjectMutationVariables};

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
  mutation UpdateProjectMutation($updatedProject: UpdateProjectInput!, $area: AreaEnum) {
    updateProject(updatedProject: $updatedProject, area: $area) {
      ...UpdateProjectMutation_project @relay (mask: false)
    }
  }
`;

export const updateProjectProjectUpdater = (
  payload: RecordProxy,
  store: RecordSourceSelectorProxy,
  viewerId: UserID,
  options?: Object // TODO: document this type
) => {
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

const UpdateProjectMutation = (
  environment: Environment,
  {updatedProject, area}: UpdateProjectMutationVariables,
  onCompleted: ?(response: UpdateProjectMutationResponse, errors: ?Array<Error>) => void,
  onError: ?(error: Error) => void
) => {
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
