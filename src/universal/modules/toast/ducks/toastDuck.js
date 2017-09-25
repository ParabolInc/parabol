const TOAST_SHOW = 'notifications/TOAST_SHOW';
const TOAST_HIDE = 'notifications/TOAST_HIDE';

const SUCCESS = 'success';
const ERROR = 'error';
const WARNING = 'warning';
const INFO = 'info';

const initialState = [];

export default function reducer(state = initialState, action = {type: ''}) {
  switch (action.type) {
    case TOAST_SHOW: {
      return state.concat(action.payload);
    }
    case TOAST_HIDE:
      return state.filter((notification) => notification.nid !== action.payload.nid);
    default:
      return state;
  }
}

let nid = 0;
export function show(opts, level = SUCCESS) {
  return {
    type: TOAST_SHOW,
    payload: {
      ...opts,
      autoDismiss: 10,
      level,
      nid: ++nid
    }
  };
}

export function showSuccess(opts) {
  return show(opts, SUCCESS);
}

export function showError(opts) {
  return show(opts, ERROR);
}

export function showWarning(opts) {
  return show(opts, WARNING);
}

export function showInfo(opts) {
  return show(opts, INFO);
}

export const hide = (aNid) => ({
  type: TOAST_HIDE,
  payload: {
    nid: aNid
  }
});
