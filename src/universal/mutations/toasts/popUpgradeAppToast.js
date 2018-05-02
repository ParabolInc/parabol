import {showWarning} from 'universal/modules/toast/ducks/toastDuck';

const popUpgradeAppToast = ({dispatch}) => {
  dispatch(showWarning({
    title: 'New stuff!',
    message: 'A new version of Parabol is available',
    autoDismiss: 0,
    action: {
      label: 'Refresh to upgrade',
      callback: () => {
        window.location.reload();
      }
    }
  }));
};

export default popUpgradeAppToast;
