import {handleRemoveOrgApproval} from 'universal/mutations/CancelApprovalMutation';

const subscription = graphql`
  subscription OrgApprovalRemovedSubscription($teamId: ID!) {
    orgApprovalRemoved(teamId: $teamId) {
      orgApproval {
        id
      }
    }
  }
`;

const OrgApprovalRemovedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const orgApprovalId = store.getRootField('orgApprovalRemoved')
        .getLinkedRecord('orgApproval')
        .getValue('id');
      handleRemoveOrgApproval(store, teamId, orgApprovalId);
    }
  };
};

export default OrgApprovalRemovedSubscription;
