import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMember {
      added {
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
      updated {
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

export const handleAddTeamMember = (store, newTeamMember) => {
  const teamId = newTeamMember && newTeamMember.getValue('teamId');
  if (!teamId) return;
  const team = store.get(teamId);
  addNodeToArray(newTeamMember, team, 'teamMembers', 'checkInOrder', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  addNodeToArray(newTeamMember, team, 'teamMembers', 'preferredName', {storageKeyArgs: {sortBy: 'preferredName'}});
};

export const handleUpdateTeamMember = (store, updatedTeamMember) => {
  if (!updatedTeamMember) return;
  const teamId = updatedTeamMember.getValue('teamId');
  const isNotRemoved = updatedTeamMember.getValue('isNotRemoved');
  const team = teamId && store.get(teamId);
  if (!team) return;
  const sorts = ['checkInOrder', 'preferredName'];
  if (isNotRemoved) {
    sorts.forEach((sortBy) => {
      const teamMembers = team.getLinkedRecords('teamMembers', {sortBy});
      if (!teamMembers) return;
      teamMembers.sort((a, b) => a.getValue(sortBy) > b.getValue(sortBy) ? 1 : -1);
      team.setLinkedRecords(teamMembers, 'teamMembers', {sortBy});
    });
  } else {
    const teamMemberId = updatedTeamMember.getValue('id');
    sorts.forEach((sortBy) => {
      const teamMembers = team.getLinkedRecords('teamMembers', {sortBy});
      safeRemoveNodeFromArray(teamMemberId, teamMembers, 'teamMembers', {storageKeyArgs: {sortBy}});
    });
  }
};

const TeamMemberSubscription = () => {
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMember');
      const addedTeamMember = payload.getLinkedRecord('added');
      handleAddTeamMember(store, addedTeamMember);
      const updatedTeamMember = payload.getLinkedRecord('updated');
      handleUpdateTeamMember(store, updatedTeamMember);
    }
  };
};

export default TeamMemberSubscription;
