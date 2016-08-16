import {cashay} from 'cashay';

const EDITING_SET_CURRENT = 'editing/SET_CURRENT';
const EDITING_CLEAR_CURRENT = 'editing/CLEAR_CURRENT';
const EDITING_SET_FOCUS = 'editing/SET_FOCUS';
const EDITING_CLEAR_FOCUS = 'editing/CLEAR_FOCUS';

const initialState = {
  current: null,
  focus: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case EDITING_SET_CURRENT:
      return {
        ...state,
        current: action.payload
      };
    case EDITING_CLEAR_CURRENT:
      return {
        ...state,
        current: null
      };
    case EDITING_SET_FOCUS:
      return {
        ...state,
        focus: action.payload
      };
    case EDITING_CLEAR_FOCUS:
      return {
        ...state,
        focus: null
      };
    default:
      return state;
  }
}

export function editingSetCurrent(teamId, normalizedObjId) {
  return (dispatch, getState) => {
    dispatch({
      type: EDITING_SET_CURRENT,
      payload: normalizedObjId
    });

    const {editing: {current}} = getState();
    const options = {
      variables: {
        teamId,
        editing: current
      }
    };
    return cashay.mutate('present', options);
  };
}

export function editingClearCurrent(teamId) {
  return (dispatch, getState) => {
    dispatch({
      type: EDITING_CLEAR_CURRENT,
      payload: null
    });

    const {editing: {current}} = getState();
    const options = {
      variables: {
        teamId,
        editing: current
      }
    };
    return cashay.mutate('present', options);
  };
}

export function editingSetFocus(normalizedObjId) {
  return ({
    type: EDITING_SET_FOCUS,
    payload: normalizedObjId
  });
}

export function editingClearFocus(normalizedObjId) {
  return ({
    type: EDITING_CLEAR_FOCUS,
    payload: normalizedObjId
  });
}
