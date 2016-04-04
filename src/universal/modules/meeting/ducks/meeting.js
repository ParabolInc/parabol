import {fromJS, Map as iMap} from 'immutable';
import {push, replace} from 'react-router-redux';
import {fetchGraphQL} from '../../../utils/fetching';
import {ensureState} from 'redux-optimistic-ui';

// Changed string consts because chances are we'll have more than 1 "CREATE_SUCCESS" down the road
export const CREATE_MEETING_REQUEST = 'action/meeting/CREATE_MEETING_REQUEST';
export const CREATE_MEETING_ERROR = 'action/meeting/CREATE_MEETING_ERROR';
export const CREATE_MEETING_SUCCESS = 'action/meeting/CREATE_MEETING_SUCCESS';

//TODO multiple meetings at once? It's possible with redux-operations
// making the switch to redux-operations now is cheap, later on it'll become a pain to switch

//TODO state doesn't have an isLoading field to know when we're requesting something
const initialState = iMap({
  isLoading: false,
  isLoaded: false,
  instance: null,
  mySocketId: '',
  otherEditing: false
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CREATE_MEETING_REQUEST:
      return state.merge({
        isLoading: true
      });
    case CREATE_MEETING_SUCCESS:
      return state.merge({
        isLoading: false,
        isLoaded: true,
        instance: iMap({
          id: action.payload.id
        })
      });
    case CREATE_MEETING_ERROR:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    default:
      return state
  }
};

export function createMeetingAndRedirect() {
  return async function (dispatch, getState) {
    const query = `
    mutation {
      payload: createMeeting {
        id
      }
    }`;
    const {error, data} = await fetchGraphQL({query});
    if (error) {
      return dispatch({type: CREATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    dispatch({type: CREATE_MEETING_SUCCESS, payload});
    const id = ensureState(getState()).getIn(['meeting', 'instance', 'id']);
    // replace, don't push so a click on the back button does what we want
    dispatch(replace(`/meeting/${id}`));
  };
}
