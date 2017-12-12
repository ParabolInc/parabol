const subscription = graphql`
  subscription InvitationUpdatedSubscription($teamId: ID!) {
    invitationUpdated(teamId: $teamId) {
      invitation {
        id
        updatedAt
      }
    }
  }
`;

const InvitationUpdatedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId}
  };
};

export default InvitationUpdatedSubscription;
