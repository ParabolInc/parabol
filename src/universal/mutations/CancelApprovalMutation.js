import {commitMutation} from 'react-relay';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const mutation = graphql`
  mutation CancelApprovalMutation($orgApprovalId: ID!) {
    cancelApproval(orgApprovalId: $orgApprovalId) {
      orgApproval {
        id
      }
    }
  }
`;

export const handleRemoveOrgApproval = (store, teamId, orgApprovalId) => {
  const team = store.get(teamId);
  safeRemoveNodeFromArray(orgApprovalId, team, 'orgApprovals');
};

const CancelApprovalMutation = (environment, orgApprovalId, teamId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {orgApprovalId},
    updater: (store) => {
      handleRemoveOrgApproval(store, teamId, orgApprovalId);
    },
    optimisticUpdater: (store) => {
      handleRemoveOrgApproval(store, teamId, orgApprovalId);
    },
    onCompleted,
    onError
  });
};

export default CancelApprovalMutation;
