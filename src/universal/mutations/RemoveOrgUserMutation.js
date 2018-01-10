import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import {handleRemoveOrgApproval} from 'universal/mutations/CancelApprovalMutation';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization';
import handleRemoveOrgMembers from 'universal/mutations/handlers/handleRemoveOrgMembers';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams';

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
  fragment RemoveOrgUserMutation_projects on RemoveOrgUserPayload {
    updatedProjects {
      ...CompleteProjectFrag @relay(mask: false)
    }
  }
`;

const mutation = graphql`
  mutation RemoveOrgUserMutation($userId: ID!, $orgId: ID!) {
    removeOrgUser(userId: $userId, orgId: $orgId) {
      ...RemoveOrgUserMutation_organization @relay(mask: false)
      ...RemoveOrgUserMutation_team @relay(mask: false)
      ...RemoveOrgUserMutation_teamMember @relay(mask: false)
      ...RemoveOrgUserMutation_project @relay(mask: false)
    }
  }
`;

export const removeOrgUserOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'removedOrgMember', 'user', 'id');
  const orgId = getInProxy(payload, 'organization', 'id');
  if (removedUserId === viewerId) {
    handleRemoveOrganization(orgId, store, viewerId);
  } else {
    handleRemoveOrgMembers(orgId, removedUserId, store);
  }
};

export const removeOrgUserNotificationUpdater = (payload, store, viewerId) => {
  const removedTeamNotifications = payload.getLinkedRecords('removedTeamNotifications');
  const teamNotificationIds = getInProxy(removedTeamNotifications, 'id');
  handleRemoveNotifications(teamNotificationIds, store, viewerId);

  const removedOrgNotifications = payload.getLinkedRecords('removedOrgNotifications');
  const orgNotificationIds = getInProxy(removedOrgNotifications, 'id');
  handleRemoveNotifications(orgNotificationIds, store, viewerId);
};

export const removeOrgUserTeamUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'removedOrgMember', 'user', 'id');
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams');
    const teamIds = getInProxy(teams, 'id');
    handleRemoveTeams(teamIds, store, viewerId);
  }
};

export const removeOrgUserTeamMemberUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'removedOrgMember', 'user', 'id');
  if (removedUserId === viewerId) {
    const teams = payload.getLinkedRecords('teams');
    const teamIds = getInProxy(teams, 'id');
    handleRemoveTeams(teamIds, store, viewerId)
  }
};
//export const handleRemoveOrgUserPayload = (payload, store, viewerId, options) => {

//};
const
RemoveOrgUserMutation = (environment, orgId, userId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {orgId, userId},
    updater: (store) => {

    },
    optimisticUpdater: (store) => {
      handleRemoveOrganization(orgId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default RemoveOrgUserMutation;
