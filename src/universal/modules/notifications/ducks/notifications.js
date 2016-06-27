const NOTIFICATIONS_SHOW = 'notifications/NOTIFICATIONS_SHOW';
const NOTIFICATIONS_HIDE = 'notifications/NOTIFICATIONS_HIDE';

const initialState = [];
let nid = 0;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS_SHOW: {
      // eslint-disable-next-line no-unused-vars
      const {type, ...typelessAction} = action;
      return state.concat({...typelessAction, nid: ++nid});
    }
    case NOTIFICATIONS_HIDE:
      return state.filter(notification => notification.nid !== action.nid);
    default:
      return state;
  }
}

export function show(opts, level = 'success') {
  return {
    type: NOTIFICATIONS_SHOW,
    ...opts,
    level
  };
}

export function success(opts) {
  return show(opts, 'success');
}

export function error(opts) {
  return show(opts, 'error');
}

export function warning(opts) {
  return show(opts, 'warning');
}

export function info(opts) {
  return show(opts, 'info');
}

export function hide(aNid) {
  return {
    type: NOTIFICATIONS_HIDE,
    nid: aNid
  };
}
