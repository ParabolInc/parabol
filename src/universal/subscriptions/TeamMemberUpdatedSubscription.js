const subscription = graphql`
  subscription TeamMemberUpdatedSubscription($teamId: ID!) {
    teamMemberUpdated(teamId: $teamId) {
      teamMember {
        isLead
        isNotRemoved
        picture
        preferredName
        checkInOrder
        isCheckedIn
        isConnected
      }
    }
  }
`;

export const handleUpdateTeamMember = (store, teamId) => {
  const team = store.get(teamId);
  const sorts = ['checkInOrder', 'preferredName'];
  sorts.forEach((sortBy) => {
    const teamMembers = team.getLinkedRecords('teamMembers', {sortBy});
    if (teamMembers) {
      teamMembers.sort((a, b) => a.getValue(sortBy) > b.getValue(sortBy) ? 1 : -1);
      team.setLinkedRecords(teamMembers, 'teamMembers', {sortBy});
    }
  });
};

const TeamMemberUpdatedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      handleUpdateTeamMember(store, teamId);
    }
  };
};

export default TeamMemberUpdatedSubscription;
