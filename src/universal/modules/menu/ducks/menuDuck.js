const OPEN_MENU = 'menu/OPEN_MENU';
const CLOSE_MENU = 'menu/CLOSE_MENU';

const initialState = {
  // [menuKey]: {
  //   isOpen: false
  // }
};

export default function reducer(state = initialState, action = {type: ''}) {
  if (!action.type.startsWith('menu/')) return state;
  const {type, payload: {menuKey}} = action;
  if (type === OPEN_MENU) {
    return {
      ...state,
      [menuKey]: {
        // for future things like active item, etc.
        ...state[menuKey],
        isOpen: true
      }
    };
  } else if (type === CLOSE_MENU) {
    const cloneState = {...state};
    delete cloneState[menuKey];
    return cloneState;
  }
  return state;
}

export const setMenu = (menuKey, isOpen) => {
  return {
    type: isOpen ? OPEN_MENU : CLOSE_MENU,
    payload: {menuKey}
  };
};
