import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const subscription = graphql`
  subscription OrgApprovalAddedSubscription($teamId: ID!) {
    orgApprovalAdded(teamId: $teamId) {
      orgApproval {
        id
        createdAt
        email
      }
    }
  }
`;

const OrgApprovalAddedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('orgApprovalAdded').getLinkedRecord('orgApproval');
      const team = store.get(teamId);
      addNodeToArray(newNode, team, 'orgApprovals', 'email');
    }
  };
};

export default OrgApprovalAddedSubscription;
