import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const subscription = graphql`
  subscription TeamMemberAddedSubscription {
    teamMemberAdded {
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

export const handleAddTeamMember = (store, teamId, newNode) => {
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'teamMembers', 'checkInOrder', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  addNodeToArray(newNode, team, 'teamMembers', 'preferredName', {storageKeyArgs: {sortBy: 'preferredName'}});
};

const TeamMemberAddedSubscription = () => {
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const newNode = store.getRootField('teamMemberAdded').getLinkedRecord('teamMember');
      const teamId = newNode.getValue('teamId');
      handleAddTeamMember(store, teamId, newNode);
    }
  };
};

export default TeamMemberAddedSubscription;
