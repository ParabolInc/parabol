import {cashay} from 'cashay';

const EDITING_ADD = 'editing/ADD';
const EDITING_REMOVE = 'editing/REMOVE';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case EDITING_ADD: {
      return action.payload;
    }
    case EDITING_REMOVE:
      return null;
    default:
      return state;
  }
}

export function editingAdd(teamId, normalizedObjId) {
  return (dispatch, getState) => {
    dispatch({
      type: EDITING_ADD,
      payload: normalizedObjId
    });

    const {editing} = getState();
    const options = {
      variables: {
        teamId,
        editing
      }
    };
    console.log(options);
    return cashay.mutate('present', options);
  };
}

export function editingRemove(teamId, normalizedObjId) {
  return (dispatch, getState) => {
    dispatch({
      type: EDITING_REMOVE,
      payload: normalizedObjId
    });

    const {editing} = getState();
    const options = {
      variables: {
        teamId,
        editing
      }
    };
    return cashay.mutate('present', options);
  };
}
