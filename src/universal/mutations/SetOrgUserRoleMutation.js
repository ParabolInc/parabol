import {commitMutation} from 'react-relay';
import {BILLING_LEADER} from 'universal/utils/constants';

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      updatedOrgUser {
        isBillingLeader(orgId: $orgId)
      }
    }
  }
`;

const SetOrgUserRoleMutation = (environment, orgId, userId, role, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {orgId, userId, role},
    optimisticUpdater: (store) => {
      const isBillingLeader = role === BILLING_LEADER;
      const user = store.get(userId);
      if (!user) return;
      user.setValue(isBillingLeader, 'isBillingLeader', {orgId});
    },
    onCompleted,
    onError
  });
};

export default SetOrgUserRoleMutation;
