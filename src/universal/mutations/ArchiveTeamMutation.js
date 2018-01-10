import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';
import {matchPath} from 'react-router-dom';

graphql`
  fragment ArchiveTeamMutation_team on ArchiveTeamPayload {
    team {
      id
      name
    }
    notification {
      id
      type
      ...TeamArchived_notification
    }
  }
`;

const mutation = graphql`
  mutation ArchiveTeamMutation($teamId: ID!) {
    archiveTeam(teamId: $teamId) {
      ...ArchiveTeamMutation_team @relay(mask: false)
    }
  }
`;

const popTeamArchivedToast = (payload, {dispatch, history, location, environment}) => {
  const teamId = getInProxy(payload, 'team', 'id');
  const teamName = getInProxy(payload, 'team', 'name');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'That’s it, folks!',
    message: `${teamName} has been archived.`,
    action: {
      label: 'OK',
      callback: () => {
        const notificationId = getInProxy(payload, 'notification', 'id');
        // notification is not persisted for the mutator
        if (notificationId) {
          ClearNotificationMutation(environment, notificationId);
        }
      }
    }
  }));
  const {pathname} = location;
  const onExTeamRoute = Boolean(matchPath(pathname, {
    path: `(/team/${teamId}|/meeting/${teamId})`
  }));
  if (onExTeamRoute) {
    history.push('/me');
  }
};

export const archiveTeamTeamUpdater = (payload, store, viewerId, options) => {
  const viewer = store.get(viewerId);
  const teamId = getInProxy(payload, 'team', 'id');
  safeRemoveNodeFromArray(teamId, viewer, 'teams');

  const notification = payload.getLinkedRecord('notification');
  handleAddNotifications(notification, store, viewerId);

  popTeamArchivedToast(payload, options);
};

// We technically don't need dispatch on this mutation since our biz logic guarantees the archiver won't get a toast
const ArchiveTeamMutation = (environment, teamId, options, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('archiveTeam');
      archiveTeamTeamUpdater(payload, store, viewerId, {...options, store, environment});
    },
    onCompleted,
    onError
  });
};

export default ArchiveTeamMutation;
