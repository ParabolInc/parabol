import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';
import getInProxy from 'universal/utils/relay/getInProxy';
import handleRemoveSoftTeamMembers from 'universal/mutations/handlers/handleRemoveSoftTeamMembers';
import handleUpsertTasks from 'universal/mutations/handlers/handleUpsertTasks';

graphql`
  fragment CancelApprovalMutation_orgApproval on CancelApprovalPayload {
    orgApproval {
      id
      teamId
    }
  }
`;

graphql`
  fragment CancelApprovalMutation_notification on CancelApprovalPayload {
    removedRequestNotification {
      id
    }
  }
`;

graphql`
  fragment CancelApprovalMutation_task on CancelApprovalPayload {
    archivedSoftTasks {
      ...CompleteTaskFrag @relay(mask: false)
    }
  }
`;

graphql`
  fragment CancelApprovalMutation_teamMember on CancelApprovalPayload {
    removedSoftTeamMember {
      id
      teamId
    }
  }
`;

const mutation = graphql`
  mutation CancelApprovalMutation($orgApprovalId: ID!) {
    cancelApproval(orgApprovalId: $orgApprovalId) {
      ...CancelApprovalMutation_notification @relay(mask: false)
      ...CancelApprovalMutation_orgApproval @relay(mask: false)
      ...CancelApprovalMutation_teamMember @relay(mask: false)
      ...CancelApprovalMutation_task @relay(mask: false)
    }
  }
`;

export const cancelApprovalTaskUpdater = (payload, store, viewerId) => {
  const archivedSoftTasks = payload.getLinkedRecords('archivedSoftTasks');
  handleUpsertTasks(archivedSoftTasks, store, viewerId);
};

export const cancelApprovalTeamMemberUpdater = (payload, store) => {
  const removedSoftTeamMember = payload.getLinkedRecord('removedSoftTeamMember');
  handleRemoveSoftTeamMembers(removedSoftTeamMember, store);
};

export const cancelApprovalOrgApprovalUpdater = (payload, store) => {
  const orgApproval = payload.getLinkedRecord('orgApproval');
  handleRemoveOrgApprovals(orgApproval, store);
};

export const cancelApprovalNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'removedRequestNotification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const CancelApprovalMutation = (environment, orgApprovalId, teamId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {orgApprovalId},
    updater: (store) => {
      const payload = store.getRootField('cancelApproval');
      cancelApprovalNotificationUpdater(payload, store, viewerId);
      cancelApprovalOrgApprovalUpdater(payload, store);
      cancelApprovalTeamMemberUpdater(payload, store);
      cancelApprovalTaskUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      const orgApproval = store.get(orgApprovalId)
        .setValue(teamId, 'teamId');
      handleRemoveOrgApprovals(orgApproval, store);
    },
    onCompleted,
    onError
  });
};

export default CancelApprovalMutation;
