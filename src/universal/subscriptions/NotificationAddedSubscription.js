import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {ADD_TO_TEAM, ephemeralNotifications, FACILITATOR_REQUEST} from 'universal/utils/constants';
import isNotificationEphemeral from 'universal/utils/isNotificationEphemeral';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const subscription = graphql`
  subscription NotificationAddedSubscription {
    notificationAdded {
      notification {
        id
        orgId
        startAt
        type
        ... on NotifyFacilitatorRequest {
          requestorName
          requestorId
        }
        ... on NotifyAddedToTeam {
          _authToken {
            sub
          }
          inviterName
          teamName
        }
      }
    }
  }
`;

export const addNotificationUpdater = (store, viewerId, newNode) => {
  const viewer = store.get(viewerId);
  const notifications = viewer.getLinkedRecords('notifications');
  if (notifications) {
    const newNodes = insertNodeBefore(notifications, newNode, 'startAt');
    viewer.setLinkedRecords(newNodes, 'notifications');
  }
};

const NotificationAddedSubscription = (environment, queryVariables, dispatch) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const payload = store.getRootField('notificationAdded').getLinkedRecord('notification');
      const type = payload.getValue('type');
      if (type === FACILITATOR_REQUEST) {
        const requestorName = payload.getValue('requestorName');
        const requestorId = payload.getValue('requestorId');
        dispatch(showInfo({
          title: `${requestorName} wants to facilitate`,
          message: 'Click \'Promote\' to hand over the reigns',
          autoDismiss: 0,
          action: {
            label: 'Promote',
            callback: () => {
              const onError = (err) => {
                console.error(err);
              };
              PromoteFacilitatorMutation(environment, requestorId, onError);
            }
          }
        }));
      } else if (type === ADD_TO_TEAM) {
        const teamName = payload.getValue('teamName');
        dispatch(showInfo({
          title: 'Congratulations!',
          message: `You've been added to team ${teamName}`
        }));
      }
      if (isNotificationEphemeral(type)) {
        addNotificationUpdater(store, viewerId, payload);
      }
    }
  });
};

export default NotificationAddedSubscription;
