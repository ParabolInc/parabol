import handleAddOrgApprovals from 'universal/mutations/handlers/handleAddOrgApprovals';
import handleRemoveOrgApprovals from 'universal/mutations/handlers/handleRemoveOrgApprovals';

const subscription = graphql`
  subscription OrgApprovalSubscription($teamId: ID!) {
    orgApprovalSubscription(teamId: $teamId) {
      __typename
      ... on OrgApprovalAdded {
        orgApproval {
          ...CompleteOrgApprovalFrag @relay(mask: false)
        }
      }
      ... on OrgApprovalRemoved {
        orgApproval {
          id
        }
      }
    }
  }
`;

const OrgApprovalSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('orgApprovalSubscription');
      const type = payload.getValue('__typename');
      const orgApproval = payload.getLinkedRecord('orgApproval');
      if (type === 'OrgApprovalAdded') {
        handleAddOrgApprovals(orgApproval, store);
      } else if (type === 'OrgApprovalRemoved') {
        const orgApprovalId = orgApproval.getValue('id');
        handleRemoveOrgApprovals(orgApprovalId, store);
      }
    }
  };
};

export default OrgApprovalSubscription;
