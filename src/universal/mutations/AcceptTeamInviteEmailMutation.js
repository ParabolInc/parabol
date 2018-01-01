import jwtDecode from 'jwt-decode';
import {commitMutation} from 'react-relay';
import {successfulExistingJoin, successfulJoin} from 'universal/modules/invitation/helpers/notifications';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';
import handleAddTeams from 'universal/mutations/handlers/handleAddTeams';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleToastError from 'universal/mutations/handlers/handleToastError';
import {setAuthToken} from 'universal/redux/authDuck';
import getInProxy from 'universal/utils/relay/getInProxy';

const mutation = graphql`
  mutation AcceptTeamInviteEmailMutation($inviteToken: ID!) {
    acceptTeamInviteEmail(inviteToken: $inviteToken) {
      team {
        ...CompleteTeamFrag @relay(mask: false)
      }
      authToken
      removedNotification {
        id
      }
      error {
        title
        message
      }
    }
  }
`;

const AcceptTeamInviteEmailMutation = (environment, inviteToken, dispatch, history, onError) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {inviteToken},
    updater: (store) => {
      const payload = store.getRootField('acceptTeamInviteEmail');
      const team = payload.getLinkedRecord('team');
      const removedNotification = payload.getLinkedRecord('removedNotification');
      const error = payload.getLinkedRecord('error');
      const notificationId = getInProxy(removedNotification, 'id');
      handleAddTeams(team, store, viewerId);
      handleRemoveNotifications(notificationId, store, viewerId);
      handleToastError(error, dispatch);
    },
    onError,
    onCompleted: (data) => {
      const {acceptTeamInviteEmail: {team: {id: teamId}, authToken}} = data;
      const {tms} = jwtDecode(authToken);
      dispatch(setAuthToken(authToken));
      if (tms.length <= 1) {
        dispatch(showSuccess(successfulJoin));
        dispatch(setWelcomeActivity(`/team/${teamId}`));
        history.push('/me/settings');
      } else {
        dispatch(showSuccess(successfulExistingJoin));
        history.push(`/team/${teamId}`);
      }
    }
  });
};

export default AcceptTeamInviteEmailMutation;
