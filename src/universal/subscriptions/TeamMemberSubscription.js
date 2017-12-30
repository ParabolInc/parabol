import {handleNotification} from 'universal/subscriptions/NotificationsAddedSubscription';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

graphql`
  fragment TeamMemberSubscription_teamMember on TeamMember {
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
`;

const subscription = graphql`
  subscription TeamMemberSubscription {
    teamMemberSubscription {
      __typename
      ... on TeamMemberAdded {
        teamMember {
          ...TeamMemberSubscription_teamMember
        }
        notification {
          type
          preferredName
          team {
            name
          }
        }
      }
      ... on TeamMemberUpdated {
        teamMember {
          ...TeamMemberSubscription_teamMember
        }
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
        handleAddTeamMember(store, teamMember, notification, dispatch);
        handleNotification(notification, {dispatch});
      }
      const updatedTeamMember = payload.getLinkedRecord('updated');
      handleUpdateTeamMember(store, updatedTeamMember);
    }
  };
};

export default TeamMemberSubscription;
