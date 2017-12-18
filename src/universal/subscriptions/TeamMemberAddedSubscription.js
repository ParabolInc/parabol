import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const subscription = graphql`
  subscription TeamMemberAddedSubscription($teamId: ID!) {
    teamMemberAdded(teamId: $teamId) {
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

export const handleAddTeamMember = (store, teamId, newNode) => {
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'teamMembers', 'checkInOrder', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  addNodeToArray(newNode, team, 'teamMembers', 'preferredName', {storageKeyArgs: {sortBy: 'preferredName'}});
};

const TeamMemberAddedSubscription = (environment, queryVariables) => {
  const {teamId} = queryVariables;
  return {
    subscription,
    variables: {teamId},
    updater: (store) => {
      const newNode = store.getRootField('teamMemberAdded').getLinkedRecord('teamMember');
      handleAddTeamMember(store, teamId, newNode);
    }
  };
};

export default TeamMemberAddedSubscription;
