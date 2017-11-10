const subscription = graphql`
  subscription MeetingUpdatedSubscription($teamId: ID!) {
    meetingUpdated(teamId: $teamId) {
      team {
        checkInGreeting {
          content
          language
        }
        checkInQuestion
        id
        name
        meetingId
        activeFacilitator
        facilitatorPhase
        facilitatorPhaseItem
        meetingPhase
        meetingPhaseItem
      }
    }
  }
`;

const MeetingUpdatedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId}
  };
};

export default MeetingUpdatedSubscription;
