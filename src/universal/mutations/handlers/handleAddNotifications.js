import {matchPath} from 'react-router-dom';
import {ConnectionHandler} from 'relay-runtime';
import {showInfo, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import {
  DENY_NEW_USER, FACILITATOR_REQUEST, INVITEE_APPROVED, KICKED_OUT,
  PAYMENT_REJECTED
} from 'universal/utils/constants';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

export const addNotificationToConn = (store, viewerId, newNode) => {
  const viewer = store.get(viewerId);
  const conn = getNotificationsConn(viewer);
  if (!conn) return;
  const nodeId = newNode.getValue('id');
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId);
  if (matchingNodes.length === 0) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      conn,
      newNode,
      'NotificationEdge'
    );
    newEdge.setValue(newNode.getValue('startAt'), 'cursor');
    ConnectionHandler.insertEdgeBefore(conn, newEdge);
  }
};


const notificationHandler = {
  [DENY_NEW_USER]: (payload, {dispatch, store, history, environment}) => {
    const {viewerId} = environment;
    const inviteeEmail = payload.getValue('inviteeEmail');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Oh no!',
      message: `${inviteeEmail} was denied to join the team.`,
      action: {
        label: 'Find out why',
        callback: () => {
          history.push('/me/notifications');
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [INVITEE_APPROVED]: (payload, {dispatch, store, environment}) => {
    const {viewerId} = environment;
    const inviteeEmail = payload.getValue('inviteeEmail');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Approved!',
      message: `${inviteeEmail} has been approved by your organization. We just sent them an invitation.`,
      action: {
        label: 'Great!',
        callback: () => {
          const notificationId = payload.getValue('id');
          ClearNotificationMutation(environment, notificationId);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [KICKED_OUT]: (payload, {dispatch, history, location, environment, store}) => {
    const {viewerId} = environment;
    const team = payload.getLinkedRecord('team');
    const teamName = team.getValue('name');
    const teamId = team.getValue('id');
    dispatch(showWarning({
      autoDismiss: 10,
      title: 'So long!',
      message: `You have been removed from ${teamName}`,
      action: {
        label: 'OK',
        callback: () => {
          const notificationId = payload.getValue('id');
          ClearNotificationMutation(environment, notificationId);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
    const {pathname} = location;
    const onExTeamRoute = Boolean(matchPath(pathname, {
      path: `(/team/${teamId}|/meeting/${teamId})`
    }));
    if (onExTeamRoute) {
      history.push('/me');
    }
  },
  [PAYMENT_REJECTED]: (payload, {dispatch, environment, store, history}) => {
    const {viewerId} = environment;
    const organization = payload.getLinkedRecord('organization');
    const orgId = organization.getValue('id');
    const orgName = organization.getValue('name');
    // TODO add brand and last 4
    dispatch(showWarning({
      autoDismiss: 10,
      title: 'Oh no!',
      message: `Your credit card for ${orgName} was rejected.`,
      action: {
        label: 'Fix it!',
        callback: () => {
          history.push(`/me/organizations/${orgId}`);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  }
};

const handleAddNotification = (newNode, store, viewerId) => {
  const viewer = store.get(viewerId);
  const conn = getNotificationsConn(viewer);
  if (!conn) return;
  const nodeId = newNode.getValue('id');
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId);
  if (matchingNodes.length === 0) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      conn,
      newNode,
      'NotificationEdge'
    );
    newEdge.setValue(newNode.getValue('startAt'), 'cursor');
    ConnectionHandler.insertEdgeBefore(conn, newEdge);
  }
};

const handleAddNotifications = pluralizeHandler(handleAddNotification);
export default handleAddNotifications;
