import {handleAddTeamToViewerTeams} from 'universal/mutations/AddTeamMutation';
import {handleRemoveTeam} from 'universal/mutations/ArchiveTeamMutation';
import {handleNotification} from 'universal/subscriptions/NotificationsAddedSubscription';

// eslint-disable-next-line no-unused-expressions
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
      ... on TeamRemoved {
        team {
          id
        }
        notification {
          id
          orgId
          startAt
          type
          ... on NotifyTeamArchived {
            team {
              name
            }
          }
          ... on NotifyKickedOut {
            isKickout
            team {
              id
              name
            }
          }
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
      const notification = payload.getLinkedRecord('notification');
      if (type === 'TeamAdded') {
        handleAddTeamToViewerTeams(store, viewerId, team);
      } else if (type === 'TeamRemoved') {
        const teamId = team.getValue('id');
        handleRemoveTeam(store, viewerId, teamId);
      }
      handleNotification(notification, {dispatch, environment, store});
    }
  };
};

export default TeamSubscription;
