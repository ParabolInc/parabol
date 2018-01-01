import {commitMutation} from 'react-relay';
import {BILLING_LEADER} from 'universal/utils/constants';
import toOrgMemberId from 'universal/utils/relay/toOrgMemberId';

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      updatedOrgMember {
        isBillingLeader
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
      const orgMemberId = toOrgMemberId(orgId, userId);
      const orgMember = store.get(orgMemberId);
      if (!orgMember) return;
      orgMember.setValue(isBillingLeader, 'isBillingLeader');
    },
    onCompleted,
    onError
  });
};

export default SetOrgUserRoleMutation;
