import handleAddInvitations from 'universal/mutations/handlers/handleAddInvitations';

const subscription = graphql`
  subscription InvitationAddedSubscription($teamId: ID!) {
    invitationAdded(teamId: $teamId) {
      invitation {
        id
        email
        teamId
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
      const invitation = store.getRootField('invitationAdded').getLinkedRecord('invitation');
      handleAddInvitations(invitation, store);
    }
  };
};

export default InvitationAddedSubscription;
