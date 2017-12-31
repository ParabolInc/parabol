import {matchPath} from 'react-router-dom';
import {ConnectionHandler} from 'relay-runtime';
import {showInfo, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import PromoteFacilitatorMutation from 'universal/mutations/PromoteFacilitatorMutation';
import {
  ADD_TO_TEAM, APP_UPGRADE_PENDING_KEY, APP_UPGRADE_PENDING_RELOAD, APP_VERSION_KEY, DENY_NEW_USER,
  FACILITATOR_DISCONNECTED, FACILITATOR_REQUEST, INVITEE_APPROVED, JOIN_TEAM, KICKED_OUT, MENTIONEE, PAYMENT_REJECTED,
  PROJECT_INVOLVES, PROMOTE_TO_BILLING_LEADER, REJOIN_TEAM, REQUEST_NEW_USER, TEAM_ARCHIVED, TEAM_INVITE, VERSION_INFO
} from 'universal/utils/constants';
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn';

export const addNotificationToConn = (store, viewerId, newNode) => {
  const viewer = store.get(viewerId);
  const conn = ConnectionHandler.getConnection(
    viewer,
    'DashboardWrapper_notifications'
  );
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
  [ADD_TO_TEAM]: (payload, {dispatch, store, environment}) => {
    const {viewerId} = environment;
    const team = payload.getLinkedRecord('team');
    const teamName = team.getValue('name');
    const notificationId = payload.getValue('id');
    // notificationId isn't always present because if i accept to join i want the authToken but no notification
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
      addNotificationToConn(store, viewerId, payload);
    }
  },
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
  [FACILITATOR_DISCONNECTED]: (payload, {environment, dispatch, store}) => {
    const oldFacilitatorName = payload
      .getLinkedRecord('oldFacilitator')
      .getValue('preferredName');
    const newFacilitator = payload.getLinkedRecord('newFacilitator');
    const newFacilitatorName = newFacilitator.getValue('preferredName');
    const newFacilitatorTeamMemberId = newFacilitator.getValue('id');
    const newFacilitatorUserId = newFacilitator.getValue('userId');
    const teamId = payload.getValue('teamId');
    const team = store.get(teamId);
    // this can happen if it comes it during a refresh
    if (!team) return;
    team.setValue(newFacilitatorTeamMemberId, 'activeFacilitator');
    const {userId} = environment;
    const facilitatorIntro = userId === newFacilitatorUserId ? 'You are' : `${newFacilitatorName} is`;
    dispatch(showInfo({
      title: `${oldFacilitatorName} Disconnected!`,
      message: `${facilitatorIntro} the new facilitator`
    }));
  },
  [FACILITATOR_REQUEST]: (payload, {environment, dispatch}) => {
    const requestor = payload.getLinkedRecord('requestor');
    if (!requestor) return;
    const requestorName = requestor.getValue('preferredName');
    const requestorId = requestor.getValue('id');
    dispatch(showInfo({
      title: `${requestorName} wants to facilitate`,
      message: 'Tap ‘Promote’ to hand over the reins',
      autoDismiss: 0,
      action: {
        label: 'Promote',
        callback: () => {
          PromoteFacilitatorMutation(environment, {facilitatorId: requestorId});
        }
      }
    }));
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
  [JOIN_TEAM]: (payload, {dispatch}) => {
    const teamName = payload.getLinkedRecord('team').getValue('name');
    const preferredName = payload.getLinkedRecord('teamMember').getValue('preferredName');

    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Ahoy, a new crewmate!',
      message: `${preferredName} just joined team ${teamName}`
    }));
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
    const orgId = payload.getValue('orgId');
    dispatch(showWarning({
      autoDismiss: 10,
      title: 'Oh no!',
      message: 'Your credit card was rejected.',
      action: {
        label: 'Fix it!',
        callback: () => {
          history.push(`/me/organizations/${orgId}`);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [PROJECT_INVOLVES]: (payload, {dispatch, history, environment, store}) => {
    const inMeeting = Boolean(matchPath(location.pathname, {
      path: '/meeting',
      exact: false,
      strict: false
    }));
    if (inMeeting) {
      return;
    }
    const {viewerId} = environment;
    const involvement = payload.getValue('involvement');
    const changeAuthorName = payload.getLinkedRecord('changeAuthor').getValue('preferredName');
    const wording = involvement === MENTIONEE ? 'mentioned you in' : 'assigned you to';
    const message = `${changeAuthorName} ${wording} a project`;
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Fresh work!',
      message,
      action: {
        label: 'Check it out!',
        callback: () => {
          history.push('/me/notifications');
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [PROMOTE_TO_BILLING_LEADER]: (payload, {dispatch, history, environment, store}) => {
    const {viewerId} = environment;
    const orgId = payload.getValue('orgId');
    const groupName = payload.getValue('groupName');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Congratulations!',
      message: `You’ve been promoted to billing leader for ${groupName}`,
      action: {
        label: 'Check it out!',
        callback: () => {
          history.push(`/me/organizations/${orgId}/members`);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [REJOIN_TEAM]: (payload, {dispatch}) => {
    const preferredName = payload.getValue('preferredName');
    const team = payload.getLinkedRecord('team');
    const teamName = team.getValue('name');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'They’re back!',
      message: `${preferredName} has rejoined ${teamName}`
    }));
  },
  [REQUEST_NEW_USER]: (payload, {dispatch, history, store, environment}) => {
    const {viewerId} = environment;
    const inviterName = payload.getLinkedRecord('inviter').getValue('preferredName');
    // TODO highlight the id, but don't store the state in the url cuz ugly
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'Approval Requested!',
      message: `${inviterName} would like to invite someone to their team`,
      action: {
        label: 'Check it out',
        callback: () => {
          history.push('/me/notifications');
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [TEAM_ARCHIVED]: (payload, {dispatch, store, environment}) => {
    const {viewerId} = environment;
    const teamName = payload.getLinkedRecord('team').getValue('name');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'That’s it, folks!',
      message: `${teamName} has been archived.`,
      action: {
        label: 'OK',
        callback: () => {
          const notificationId = payload.getValue('id');
          ClearNotificationMutation(environment, notificationId);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [TEAM_INVITE]: (payload, {dispatch, store, environment}) => {
    const {viewerId} = environment;
    const inviterName = payload.getLinkedRecord('inviter').getValue('preferredName');
    const team = payload.getLinkedRecord('team');
    const teamName = team.getValue('name');
    dispatch(showInfo({
      autoDismiss: 10,
      title: 'You’re invited!',
      message: `${inviterName} would like you to join their team ${teamName}`,
      action: {
        label: 'Accept!',
        callback: () => {
          const notificationId = payload.getValue('id');
          const onCompleted = () => {
            dispatch(showInfo({
              autoDismiss: 10,
              title: 'Congratulations!',
              message: `You’ve been added to team ${teamName}`
            }));
          };
          AcceptTeamInviteMutation(environment, notificationId, undefined, onCompleted);
        }
      }
    }));
    addNotificationToConn(store, viewerId, payload);
  },
  [VERSION_INFO]: (payload, {dispatch, history}) => {
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
    const versionOnServer = payload.getValue('version');
    if (versionOnServer !== versionInStorage) {
      dispatch(showWarning({
        title: 'New stuff!',
        message: 'A new version of Parabol is available',
        autoDismiss: 0,
        action: {
          label: 'Log out and upgrade',
          callback: () => {
            history.replace('/signout');
          }
        }
      }));
      window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
        APP_UPGRADE_PENDING_RELOAD);
    }
  }
};

const handleAddNotification = (newNode, options) => {
  const type = newNode.getValue('type');
  const handler = notificationHandler[type];
  if (handler) {
    handler(newNode, options);
  }
};

const handleAddNotifications = pluralizeHandler(handleAddNotification);
export default handleAddNotifications;
