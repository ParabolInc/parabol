import {matchPath} from 'react-router-dom';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {MENTIONEE} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';

const popInvolvementToast = (notification, {dispatch, location, history}) => {
  const involvement = notification.getValue('involvement');
  const changeAuthorName = getInProxy(notification, 'changeAuthor', 'preferredName');
  const inMeeting = Boolean(matchPath(location.pathname, {
    path: '/meeting',
    exact: false,
    strict: false
  }));
  if (inMeeting) return;

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
};

export default popInvolvementToast;
