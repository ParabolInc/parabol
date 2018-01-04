import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

graphql`
  fragment ArchiveTeamMutation_team on ArchiveTeamPayload {
    team {
      id
    }
    notification {
      id
      team {
        name
      }
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

const popTeamArchivedToast = (payload, dispatch, environment) => {
  const teamName = getInProxy(payload, 'team', 'name');
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
};

export const archiveTeamTeamUpdater = (payload, store, environment, dispatch) => {
  const {viewerId} = environment;
  const viewer = store.get(viewerId);
  const teamId = getInProxy(payload, 'team', 'id');
  safeRemoveNodeFromArray(teamId, viewer, 'teams');

  const notification = payload.getLinkedRecord('notification');
  handleAddNotifications(notification, store, viewerId);

  popTeamArchivedToast(payload, dispatch, environment);
};

// We technically don't need dispatch on this mutation since our biz logic guarantees the archiver won't get a toast
const ArchiveTeamMutation = (environment, teamId, dispatch, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('archiveTeam');
      archiveTeamTeamUpdater(payload, store, environment, dispatch);
    },
    onCompleted,
    onError
  });
};

export default ArchiveTeamMutation;
