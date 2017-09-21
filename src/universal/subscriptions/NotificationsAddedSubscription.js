import {ConnectionHandler} from 'relay-runtime';
import {showInfo, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {
  ADD_TO_TEAM,
  FACILITATOR_REQUEST,
  INVITEE_APPROVED,
  KICKED_OUT, REJOIN_TEAM,
  REQUEST_NEW_USER,
  TEAM_INVITE
} from 'universal/utils/constants';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';
import {matchPath} from 'react-router-dom';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

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
        ... on NotifyKickedOut {
          authToken
          isKickout
          teamName
          teamId
        }
        ... on NotifyNewTeamMember {
          preferredName
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
  const nodeId = newNode.getValue('id');
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId);
  if (conn && matchingNodes.length === 0) {
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

const NotificationsAddedSubscription = (environment, queryVariables, {dispatch, history, location}) => {
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
          const id = payload.getValue('id');
          const {id: localId} = fromGlobalId(id);
          dispatch(showInfo({
            title: 'Congratulations!',
            message: `You've been added to team ${teamName}`
          }));
          if (localId) {
            addNotificationUpdater(store, viewerId, payload);
          }
        } else if (type === INVITEE_APPROVED) {
          const inviteeEmail = payload.getValue('inviteeEmail');
          dispatch(showInfo({
            title: 'Approved!',
            message: `${inviteeEmail} has been approved by your organization. We just sent them an invitation.`
          }));

          addNotificationUpdater(store, viewerId, payload);
        } else if (type === KICKED_OUT) {
          const teamName = payload.getValue('teamName');
          const teamId = payload.getValue('teamId');
          const isKickout = payload.getValue('isKickout');
          if (isKickout) {
            dispatch(showWarning({
              title: 'So long!',
              message: `You have been removed from ${teamName}`
            }));
            addNotificationUpdater(store, viewerId, payload);
          }
          const {pathname} = location;
          const onExTeamRoute = Boolean(matchPath(pathname, {
            path: `(/team/${teamId}|/meeting/${teamId})`
          }));
          if (onExTeamRoute) {
            history.push('/me');
          }
        } else if (type === REQUEST_NEW_USER) {
          const inviterName = payload.getValue('inviterName');
          // TODO highlight the id, but don't store the state in the url cuz ugly
          // const globalId = payload.getValue('id');
          // const {id: dbId} = fromGlobalId(globalId);
          dispatch(showInfo({
            title: 'Approval Requested!',
            message: `${inviterName} would like to invite someone to their team`,
            action: {
              label: 'Check it out',
              callback: () => {
                history.push('/me/notifications');
              }
            }
          }));
          addNotificationUpdater(store, viewerId, payload);
        } else if (type === REJOIN_TEAM) {
          const preferredName = payload.getValue('preferredName');
          const teamName = payload.getValue('teamName');
          dispatch(showInfo({
            title: 'They\'re back!',
            message: `${preferredName} has rejoined ${teamName}`,
          }));
        } else if (type === TEAM_INVITE) {
          const inviterName = payload.getValue('inviterName');
          dispatch(showInfo({
            title: 'You\'re invited!',
            message: `${inviterName} would like you to join their team`,
            action: {
              label: 'Check it out',
              callback: () => {
                history.push('/me/notifications');
              }
            }
          }));
          addNotificationUpdater(store, viewerId, payload);
        }
      });
    }
  });
};

export default NotificationsAddedSubscription;
