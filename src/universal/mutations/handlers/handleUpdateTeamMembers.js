import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleUpdateTeamMember = (updatedTeamMember, store) => {
  if (!updatedTeamMember) return;
  const {teamId} = fromTeamMemberId(updatedTeamMember.getValue('id'));
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

const handleUpdateTeamMembers = pluralizeHandler(handleUpdateTeamMember);
export default handleUpdateTeamMembers;
