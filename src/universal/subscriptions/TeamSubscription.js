import {handleAddTeamToViewerTeams} from 'universal/mutations/AddTeamMutation';
import {handleRemoveTeam} from 'universal/mutations/ArchiveTeamMutation';
import {handleNotification} from 'universal/subscriptions/NotificationsAddedSubscription';

graphql`
  fragment TeamSubscription_team on Team {
    id
    name
    isPaid
    meetingId
    isArchived
  }
`;

const subscription = graphql`
  subscription TeamSubscription {
    teamSubscription {
      __typename
      ... on TeamAdded {
        notification {
          id
          team {
            id
            name
          }
        }
        team {
          ...TeamSubscription_team
          teamMembers(sortBy: "preferredName") {
            ...TeamMemberSubscription_teamMember     
          }
        }
      }
      ... on TeamUpdated {
        team {
          ...TeamSubscription_team
        }
      }
    }
  }
`;

const TeamSubscription = (environment, queryVariables, subParams) => {
  const {dispatch} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('teamSubscription');
      const team = payload.getLinkedRecord('team');
      const type = payload.getValue('__typename');
      if (type === 'TeamAdded') {
        const notification = payload.getLinkedRecord('notification');
        handleAddTeamToViewerTeams(store, viewerId, team);
        handleNotification(notification, {dispatch, environment, store});
      } else if (type === 'TeamUpdated') {
        const isArchived = team.getValue('isArchived');
        if (isArchived) {
          const teamId = team.getValue('id');
          handleRemoveTeam(store, viewerId, teamId);
        }
      }
    }
  };
};

export default TeamSubscription;
