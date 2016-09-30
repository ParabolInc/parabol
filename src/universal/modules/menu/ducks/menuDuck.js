const OPEN_MENU = 'menu/OPEN_MENU';

const initialState = {
  // [menuKey]: {
  //   isOpen: false
  // }
};

export default function reducer(state = initialState, action = {}) {
  if (!action.type.startsWith('menu/')) {
    return state;
  }
  const {type, payload: {menuKey, isOpen}} = action;
  if (type === OPEN_MENU) {
    // closing a menu unmounts it from state
    if (!isOpen) {
      const cloneState = {...state};
      delete cloneState[menuKey];
      return cloneState;
    } else {
      return {
        ...state,
        [menuKey]: {
          // for future things like active item, etc.
          ...state[menuKey],
          isOpen
        }
      };
    }
  }
}

export const setMenu = (menuKey, isOpen) => {
  return {
    type: OPEN_MENU,
    payload: {
      menuKey,
      isOpen
    }
  };
};
