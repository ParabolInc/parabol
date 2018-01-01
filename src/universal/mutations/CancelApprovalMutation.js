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
  const updater = (store) => {
    handleRemoveOrgApprovals(orgApprovalId, store);
  };
  return commitMutation(environment, {
    mutation,
    variables: {orgApprovalId},
    updater,
    optimisticUpdater: updater,
    onCompleted,
    onError
  });
};

export default CancelApprovalMutation;
