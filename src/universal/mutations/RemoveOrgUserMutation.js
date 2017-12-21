import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import {handleRemoveOrgApproval} from 'universal/mutations/CancelApprovalMutation';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';

const mutation = graphql`
  mutation RemoveOrgUserMutation($userId: ID!, $orgId: ID!) {
    removeOrgUser(userId: $userId, orgId: $orgId) {
      teamMembersRemoved {
        id
        teamId
      }
      inactivatedOrgApprovals {
        id
        teamId
      }
    }
  }
`;

export const handleRemoveOrgUser = (store, orgId, userId) => {
  const organization = store.get(orgId);
  if (!organization) return;
  const conn = ConnectionHandler.getConnection(organization, 'OrgMembers_orgUsers');
  safeRemoveNodeFromConn(userId, conn);
};

const RemoveOrgUserMutation = (environment, orgId, userId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {orgId, userId},
    updater: (store) => {
      const payload = store.getRootField('removeOrgUser');
      const orgApprovals = payload.getLinkedRecords('inactivatedOrgApprovals');
      orgApprovals.forEach((orgApproval) => {
        const teamId = orgApproval.getValue('teamId');
        const orgApprovalId = orgApproval.getValue('id');
        handleRemoveOrgApproval(store, teamId, orgApprovalId);
      });

      const teamMembersRemoved = payload.getLinkedRecords('teamMembersRemoved');
      teamMembersRemoved.forEach((teamMember) => {
        const teamId = teamMember.getValue('teamId');
        const team = store.get(teamId);
        if (!team) return;
        const sorts = ['preferredName', 'checkInOrder'];
        const teamMemberId = teamMember.getValue('id');
        sorts.forEach((sortBy) => {
          safeRemoveNodeFromArray(teamMemberId, team, 'teamMembers', {sortBy});
        });
      });
      handleRemoveOrgUser(store, orgId, userId);
    },
    optimisticUpdater: (store) => {
      handleRemoveOrgUser(store, orgId, userId);
    },
    onCompleted,
    onError
  });
};

export default RemoveOrgUserMutation;
