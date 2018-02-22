import {APP_UPGRADE_PENDING_KEY, APP_UPGRADE_PENDING_RELOAD, APP_VERSION_KEY} from 'universal/utils/constants';
import {showWarning} from 'universal/modules/toast/ducks/toastDuck';

const popUpgradeAppToast = (versionOnServer, {dispatch, history}) => {
  const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
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
};

export default popUpgradeAppToast;
