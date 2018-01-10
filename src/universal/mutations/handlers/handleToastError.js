import {showWarning} from 'universal/modules/toast/ducks/toastDuck';

const handleToastError = (error, dispatch) => {
  if (!error) return;
  const title = error.getValue('title');
  const message = error.getValue('message');
  dispatch(showWarning({
    title,
    message,
    action: {
      label: 'OK'
    },
    autoDismiss: 0
  }));
};

export default handleToastError;
