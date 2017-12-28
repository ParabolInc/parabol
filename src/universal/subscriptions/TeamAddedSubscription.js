import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {handleAddTeamToViewerTeams} from 'universal/mutations/AddTeamMutation';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import {addNotificationUpdater} from 'universal/subscriptions/helpers/notificationHandler';

const subscription = graphql`
  subscription TeamAddedSubscription {
    teamAdded {
      team {
        id
        isPaid
        name
      }
      notification {
        id
        team {
          id
          name
        }
      }
    }
  }
`;

const handleAddToTeamNotification = (environment, store, notification, dispatch) => {
  if (!notification) return;
  const notificationId = notification.getValue('id');
  // notificationId will be present if it is a reactivation, since we'll want to persist that message
  const teamName = notification.getLinkedRecord('team').getValue('name');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been added to team ${teamName}`,
    action: {
      label: 'Great!',
      callback: () => {
        if (notificationId) {
          ClearNotificationMutation(environment, notificationId);
        }
      }
    }
  }));
  if (notificationId) {
    addNotificationUpdater(store, environment.viewerId, notification);
  }
};

const TeamAddedSubscription = (environment, queryParams, subParams) => {
  const {dispatch} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const payload = store.getRootField('teamAdded');
      const team = payload.getLinkedRecord('team');
      handleAddTeamToViewerTeams(store, viewerId, team);

      const notification = payload.getLinkedRecord('notification');
      handleAddToTeamNotification(environment, store, notification, dispatch);
    }
  };
};

export default TeamAddedSubscription;
