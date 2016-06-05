import {Map as iMap, List as iList} from 'immutable';
import omit from 'lodash/omit';
import uuid from 'node-uuid';

export const NOTIFICATIONS_SHOW = 'notifications/NOTIFICATIONS_SHOW';
export const NOTIFICATIONS_HIDE = 'notifications/NOTIFICATIONS_HIDE';

const initialState = iList();

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case NOTIFICATIONS_SHOW:
      return state.push(
        iMap({ ...omit(action, 'type'), uuid: uuid.v4() })
      );
    case NOTIFICATIONS_HIDE:
      return state.filter(notification => notification.uuid !== action.uuid);
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

export function hide(aUuid) {
  return {
    type: NOTIFICATIONS_HIDE,
    aUuid
  };
}
