import {commitMutation} from 'react-relay';
import {matchPath} from 'react-router-dom';
import {showWarning} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization';
import handleRemoveOrgMembers from 'universal/mutations/handlers/handleRemoveOrgMembers';
import handleRemoveTasks from 'universal/mutations/handlers/handleRemoveTasks';
import handleRemoveTeamMembers from 'universal/mutations/handlers/handleRemoveTeamMembers';
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RemoveOrgUserMutation_organization on RemoveOrgUserPayload {
    organization {
      id
    }
    user {
      id
    }
  }
`;

graphql`
  fragment RemoveOrgUserMutation_notification on RemoveOrgUserPayload {
    removedTeamNotifications {
      id
    }
    removedOrgNotifications {
      id
    }
    organization {
      name
    }
    kickOutNotifications {
      id
      type
      ...KickedOut_notification @relay(mask: false)
    }
  }
`;

graphql`
  fragment RemoveOrgUserMutation_team on RemoveOrgUserPayload {
    teams {
      id
    }
    user {
      id
    }
  }
`;

graphql`
  fragment RemoveOrgUserMutation_teamMember on RemoveOrgUserPayload {
    teamMembers {
      id
    }
    user {
      id
    }
  }
`;

graphql`
  fragment RemoveOrgUserMutation_task on RemoveOrgUserPayload {
    updatedTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
    user {
      id
    }
  }
`;

const mutation = graphql`
  mutation RemoveOrgUserMutation($userId: ID!, $orgId: ID!) {
    removeOrgUser(userId: $userId, orgId: $orgId) {
      ...RemoveOrgUserMutation_organization @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_teamMember @relay(mask: false)
      ...RemoveOrgUserMutation_task @relay(mask: false)
    }
  }
`;

const popKickedOutToast = (payload, {dispatch, history, location}) => {
  const organization = payload.getLinkedRecord('organization');
  const orgName = getInProxy(organization, 'name');
  if (!orgName) return;
  const notifications = payload.getLinkedRecords('kickOutNotifications');
  const teamIds = getInProxy(notifications, 'team', 'id');
  if (!teamIds) return;
  dispatch(showWarning({
    autoDismiss: 10,
    title: 'So long!',
    message: `You have been removed from ${orgName} and all its teams`
  }));

  const {pathname} = location;
  for (let ii = 0; ii < teamIds.length; ii++) {
    const teamId = teamIds[ii];
    const onExTeamRoute = Boolean(matchPath(pathname, {
      path: `(/team/${teamId}|/meeting/${teamId})`
    }));
    if (onExTeamRoute) {
      history.push('/me');
      return;
    }
  }
};

export const removeOrgUserOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id');
  const orgId = getInProxy(payload, 'organization', 'id');
  if (removedUserId === viewerId) {
    handleRemoveOrganization(orgId, store, viewerId);
  } else {
    handleRemoveOrgMembers(orgId, removedUserId, store);
  }
};

export const removeOrgUserNotificationUpdater = (payload, store, viewerId, options) => {
  const removedTeamNotifications = payload.getLinkedRecords('removedTeamNotifications');
  const teamNotificationIds = getInProxy(removedTeamNotifications, 'id');
  handleRemoveNotifications(teamNotificationIds, store, viewerId);

  const removedOrgNotifications = payload.getLinkedRecords('removedOrgNotifications');
  const orgNotificationIds = getInProxy(removedOrgNotifications, 'id');
  handleRemoveNotifications(orgNotificationIds, store, viewerId);

  const kickOutNotifications = payload.getLinkedRecords('kickOutNotifications');
  handleAddNotifications(kickOutNotifications, payload, viewerId);

  popKickedOutToast(payload, options);
};

export const removeOrgUserTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id');
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams');
    const teamIds = getInProxy(teams, 'id');
    handleRemoveTeams(teamIds, store, viewerId);
  }
};

export const removeOrgUserTeamMemberUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id');
  if (removedUserId === viewerId) {
    const teamMembers = payload.getLinkedRecords('teamMembers');
    const teamMemberIds = getInProxy(teamMembers, 'id');
    handleRemoveTeamMembers(teamMemberIds, store);
  }
};

export const removeOrgUserTaskUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'user', 'id');
  if (removedUserId === viewerId) {
    const tasks = payload.getLinkedRecords('updatedTasks');
    const taskIds = getInProxy(tasks, 'id');
    handleRemoveTasks(taskIds, store, viewerId);
  }
};

const RemoveOrgUserMutation = (environment, orgId, userId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {orgId, userId},
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser');
      removeOrgUserOrganizationUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveOrganization(orgId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default RemoveOrgUserMutation;
