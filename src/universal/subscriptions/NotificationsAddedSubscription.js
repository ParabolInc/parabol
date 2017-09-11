import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {ADD_TO_TEAM, FACILITATOR_REQUEST} from 'universal/utils/constants';
import isNotificationEphemeral from 'universal/utils/isNotificationEphemeral';
import {insertNodeBefore} from 'universal/utils/relay/insertEdge';

const subscription = graphql`
  subscription NotificationsAddedSubscription {
    notificationsAdded {
      notifications {
        id
        orgId
        startAt
        type
        ... on NotifyAddedToTeam {
          authToken
          inviterName
          teamName
          teamId
        }
        ... on NotifyDenial {
          reason
          deniedByName
          inviteeEmail
        }
        ... on NotifyFacilitatorRequest {
          requestorName
          requestorId
        }
        ... on NotifyInvitation {
          inviterName
          inviteeEmail
          teamId
          teamName
        }
        ... on NotifyPayment {
          last4
          brand
        }
        ... on NotifyPromotion {
          groupName
        }
        ... on NotifyTeamArchived {
          teamName
        }
        ... on NotifyTrial {
          trialExpiresAt
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

const NotificationsAddedSubscription = (environment, queryVariables, dispatch) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const notifications = store.getRootField('notificationAdded').getLinkedRecords('notifications');
      notifications.forEach((payload) => {
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
      });
    }
  });
};

export default NotificationsAddedSubscription;
