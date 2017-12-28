const subscription = graphql`
  subscription TeamMemberUpdatedSubscription {
    teamMemberUpdated {
      teamMember {
        id
        checkInOrder
        isLead
        isCheckedIn
        isConnected
        isNotRemoved
        picture
        preferredName
        teamId
      }
    }
  }
`;

export const handleUpdateTeamMember = (store, teamId) => {
  const team = store.get(teamId);
  if (!team) return;
  const sorts = ['checkInOrder', 'preferredName'];
  sorts.forEach((sortBy) => {
    const teamMembers = team.getLinkedRecords('teamMembers', {sortBy});
    if (teamMembers) {
      teamMembers.sort((a, b) => a.getValue(sortBy) > b.getValue(sortBy) ? 1 : -1);
      team.setLinkedRecords(teamMembers, 'teamMembers', {sortBy});
    }
  });
};

const TeamMemberUpdatedSubscription = () => {
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const teamId = store.getRootField('teamMemberUpdated').getLinkedRecord('teamMember').getValue('teamId');
      handleUpdateTeamMember(store, teamId);
    }
  };
};

export default TeamMemberUpdatedSubscription;
