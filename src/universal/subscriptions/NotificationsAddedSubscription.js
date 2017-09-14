import {ConnectionHandler} from 'relay-runtime';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {ADD_TO_TEAM, FACILITATOR_REQUEST, REQUEST_NEW_USER} from 'universal/utils/constants';

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
  const conn = ConnectionHandler.getConnection(
    viewer,
    'SocketRoute_notifications'
  );
  console.log('connection', conn);
  if (conn) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      conn,
      newNode,
      'NotificationEdge'
    );
    newEdge.setValue(newNode.startAt, 'cursor');
    ConnectionHandler.insertEdgeBefore(conn, newEdge);
  }
};

const NotificationsAddedSubscription = (environment, queryVariables, dispatch) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const notifications = store.getRootField('notificationsAdded').getLinkedRecords('notifications');
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
        } else if (type === REQUEST_NEW_USER) {
          addNotificationUpdater(store, viewerId, payload);
        }
      });
    }
  });
};

export default NotificationsAddedSubscription;
