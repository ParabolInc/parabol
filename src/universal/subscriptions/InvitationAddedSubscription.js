import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const subscription = graphql`
  subscription InvitationAddedSubscription($teamId: ID!) {
    invitationAdded(teamId: $teamId) {
      invitation {
        id
        email
        updatedAt
      }
    }
  }
`;

const InvitationAddedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('invitationAdded').getLinkedRecord('invitation');
      const team = store.get(teamId);
      addNodeToArray(newNode, team, 'invitations', 'createdAt');
    }
  };
};

export default InvitationAddedSubscription;
