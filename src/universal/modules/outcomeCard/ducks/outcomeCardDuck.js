const OPEN_CONTENT_MENU = 'outcomeCard/OPEN_CONTENT_MENU';
const OPEN_ASSIGN_MENU = 'outcomeCard/OPEN_ASSIGN_MENU';
const OPEN_STATUS_MENU = 'outcomeCard/OPEN_STATUS_MENU';
const TOGGLE_HOVER = 'outcomeCard/TOGGLE_HOVER';
const MOUNT = 'outcomeCard/MOUNT';
const UNMOUNT = 'outcomeCard/UNMOUNT';

const areaLookup = {
  [OPEN_CONTENT_MENU]: 'content',
  [OPEN_ASSIGN_MENU]: 'assign',
  [OPEN_STATUS_MENU]: 'status'
};

const emptyState = {
  // [component]: {
  //   openArea: 'content' || 'status' || 'assign',
  //   hasHover: false
  // }
};

const initialState = {
  openArea: 'content',
  hasHover: false
};

export default function reducer(state = emptyState, action = {}) {
  if (!action.type.startsWith('outcomeCard/')) return state;
  const {type, payload: {component}} = action;
  if (type === MOUNT) {
    return {
      ...state,
      [component]: initialState
    }
  }
  if (type === UNMOUNT) {
    const cloneState = {...state};
    delete cloneState[component];
    return cloneState;
  }
  if (type === TOGGLE_HOVER) {
    // handle hover change
    return {
      ...state,
      [component]: {
        ...state[component],
        hasHover: !state[component].hasHover
      }
    }
  }

  // handle open area change
  return {
    ...state,
    [component]: {
      ...state[component],
      openArea: state[component].openArea === 'content' ? areaLookup[type] : 'content',
    }
  };
}

const actionFactory = (type) => (component) => {
  return {
    type,
    payload: {component}
  }
};

export const binder = (dispatch, actionFactories, component) => {
  const keys = Object.keys(actionFactories);
  const actionCreators = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const factory = actionFactories[key];
    actionCreators[key] = () => dispatch(factory(component))
  }
  return actionCreators;
};

export const initializer = {
  mount: actionFactory(MOUNT),
  unmount: actionFactory(UNMOUNT)
};

export const actionFactories = {
  openContentMenu: actionFactory(OPEN_CONTENT_MENU),
  toggleAssignMenu: actionFactory(OPEN_ASSIGN_MENU),
  toggleStatusMenu: actionFactory(OPEN_STATUS_MENU),
  toggleHover: actionFactory(TOGGLE_HOVER)
};

