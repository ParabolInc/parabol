import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddTeamMembers from 'universal/mutations/handlers/handleAddTeamMembers';
import handleRemoveInvitations from 'universal/mutations/handlers/handleRemoveInvitations';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ... on TeamMemberAdded {
        teamMember {
          ...CompleteTeamMemberFrag @relay(mask: false)
        }
        notification {
          type
          team {
            name
          }
          teamMember {
            preferredName
          }
        }
        removedInvitation {
          id
        }
      }
      ... on TeamMemberUpdated {
        teamMember {
          ...CompleteTeamMemberFrag @relay(mask: false)
        }
      }
    }
  }

`;

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

const TeamMemberSubscription = (environment, queryVariables, subParams) => {
  const {dispatch} = subParams;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamMemberSubscription');
      const teamMember = payload.getLinkedRecord('teamMember');
      const type = payload.getValue('__typename');
      if (type === 'TeamMemberAdded') {
        const notification = payload.getLinkedRecord('notification');
        const removedInvitation = payload.getLinkedRecord('removedInvitation');
        const removedInvitationId = removedInvitation && removedInvitation.getValue('id');
        handleAddTeamMembers(teamMember, store);
        handleAddNotifications(notification, {dispatch, environment, store});
        handleRemoveInvitations(removedInvitationId, store);
      } else if (type === 'TeamMemberUpdated') {
        handleUpdateTeamMember(store, teamMember);
      }
    }
  };
};

export default TeamMemberSubscription;
