import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import getInProxy from 'universal/utils/relay/getInProxy';

const popTeamInviteNotificationToast = (teamInviteNotification, {dispatch, environment}) => {
  const inviterName = getInProxy(teamInviteNotification, 'inviter', 'preferredName');
  if (!inviterName) return;
  const teamName = getInProxy(teamInviteNotification, 'team', 'name');
  const notificationId = getInProxy(teamInviteNotification, 'id');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'You’re invited!',
    message: `${inviterName} would like you to join their team ${teamName}`,
    action: {
      label: 'Accept!',
      callback: () => {
        AcceptTeamInviteMutation(environment, notificationId, dispatch);
      }
    }
  }));
};

export default popTeamInviteNotificationToast;
