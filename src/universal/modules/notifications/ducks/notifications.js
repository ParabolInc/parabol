const NOTIFICATIONS_SHOW = 'notifications/NOTIFICATIONS_SHOW';
const NOTIFICATIONS_HIDE = 'notifications/NOTIFICATIONS_HIDE';

const SUCCESS = 'success';
const ERROR = 'error';
const WARNING = 'warning';
const INFO = 'info';

const initialState = [];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case NOTIFICATIONS_SHOW: {
      return state.concat(action.payload);
    }
    case NOTIFICATIONS_HIDE:
      return state.filter(notification => notification.nid !== action.payload.nid);
    default:
      return state;
  }
}

let nid = 0;
export function show(opts, level = SUCCESS) {
  return {
    type: NOTIFICATIONS_SHOW,
    payload: {
      ...opts,
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

export function hide(aNid) {
  return {
    type: NOTIFICATIONS_HIDE,
    payload: {
      nid: aNid
    }
  };
}
