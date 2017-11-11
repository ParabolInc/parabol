const subscription = graphql`
  subscription TeamMemberUpdatedSubscription($teamId: ID!) {
    teamMemberUpdated(teamId: $teamId) {
      teamMember {
        isNotRemoved
        picture
        preferredName
        checkInOrder
        isCheckedIn
      }
    }
  }
`;

const TeamMemberUpdatedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId}
  };
};

export default TeamMemberUpdatedSubscription;
