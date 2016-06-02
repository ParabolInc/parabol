import {Map as iMap} from 'immutable';

export const UPDATE_SHORTCUT_MENU_STATE = 'action/meeting/UPDATE_SHORTCUT_MENU_STATE';

const initialState = iMap({
  hasOpenShortcutMenu: false
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_SHORTCUT_MENU_STATE:
      return state.merge({
        hasOpenShortcutMenu: action.payload.boolean
      });
    default:
      return state;
  }
}
