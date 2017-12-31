import {handleRemoveTeam} from 'universal/mutations/ArchiveTeamMutation';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

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
        removedTeamInviteNotification {
          id
        }
        team {
          ...CompleteTeamFragWithMembers @relay(mask: false)
        }
      }
      ... on TeamUpdated {
        team {
          ...CompleteTeamFrag @relay(mask: false)
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
        const removedNotification = payload.getLinkedRecord('removedTeamInviteNotification');
        const removedNotificationId = removedNotification && removedNotification.getValue('id');
        handleAddTeams(team, store, viewerId);
        handleRemoveNotifications(removedNotificationId, store, viewerId);
      } else if (type === 'TeamRemoved') {
        const teamId = team.getValue('id');
        handleRemoveTeam(store, viewerId, teamId);
      }
      handleAddNotifications(notification, {dispatch, environment, store});
    }
  };
};

export default TeamSubscription;
