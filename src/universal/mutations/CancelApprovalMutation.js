import {commitMutation} from 'react-relay';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';

const mutation = graphql`
  mutation CancelApprovalMutation($orgApprovalId: ID!) {
    cancelApproval(orgApprovalId: $orgApprovalId) {
      orgApproval {
        id
      }
    }
  }
`;

const CancelApprovalMutation = (environment, orgApprovalId, teamId, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {orgApprovalId},
    updater: (store) => {
      handleRemoveOrgApprovals(orgApprovalId, store);
    },
    optimisticUpdater: (store) => {
      handleRemoveOrgApprovals(orgApprovalId, store);
    },
    onCompleted,
    onError
  });
};

export default CancelApprovalMutation;
