const OPEN_MENU = 'menu/OPEN_MENU';
const CLOSE_MENU = 'menu/CLOSE_MENU';

const initialState = {
  // [menuKey]: {
  //   isOpen: false
  // }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case OPEN_MENU: {
      const {payload: {menuKey}} = action;
      return {
        ...state,
        [menuKey]: {
          // for future things like active item, etc.
          ...state[menuKey],
          isOpen: true
        }
      };
    }
    case CLOSE_MENU: {
      const {payload: {menuKey}} = action;
      const cloneState = {...state};
      delete cloneState[menuKey];
      return cloneState;
    }
    default:
      return state;
  }
}

export const setMenu = (menuKey, isOpen) => {
  return {
    type: isOpen ? OPEN_MENU : CLOSE_MENU,
    payload: {menuKey}
  };
};
