import {commitMutation} from 'react-relay';
import {handleRemoveOrgApproval} from 'universal/mutations/CancelApprovalMutation';

const mutation = graphql`
  mutation RemoveOrgUserMutation($userId: ID!, $orgId: ID!) {
    removeOrgUser(userId: $userId, orgId: $orgId) {
      teamMembersRemoved {
        id
      }
      orgApprovals {
        id
        teamId
      }
    }
  }
`;

const handleRemoveOrgUser = (store, orgId, userId) => {

};

const RemoveOrgUserMutation = (environment, notificationId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser');
      const orgApprovals = payload.getLinkedRecords('orgApprovals');
      orgApprovals.forEach((orgApproval) => {
        const teamId = orgApproval.getValue('teamId');
        const orgApprovalId = orgApproval.getValue('id');
        handleRemoveOrgApproval(store, teamId, orgApprovalId);
      });
    },
    optimisticUpdater: (store) => {

    },
    onCompleted,
    onError
  });
};

export default RemoveOrgUserMutation;
