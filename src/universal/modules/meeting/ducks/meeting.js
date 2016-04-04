import {fromJS, Map as iMap} from 'immutable';
import {push, replace} from 'react-router-redux';
import {fetchGraphQL, prepareGraphQLParams} from '../../../utils/fetching';
import {ensureState} from 'redux-optimistic-ui';
import {localStorageVars} from '../../../utils/clientOptions';
import socketCluster from 'socketcluster-client';

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

export function loadMeeting(meetingId) {
  const query = `
  subscription($meetingId: !String) {
    getMeeting(meetingId: $meetingId) {
      id,
      content
    }
  }`;
  const serializedParams = prepareGraphQLParams({query});
  const sub = 'getMeeting';
  const {authTokenName} = localStorageVars;
  const socket = socketCluster.connect({authTokenName});
  socket.subscribe(serializedParams, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      const meta = {synced: true};
      if (!data.old_val) {
        dispatch(addLane(data.new_val, meta));
      } else if (!data.new_val) { // eslint-disable-line no-negated-condition
        dispatch(deleteLane(data.old_val.id, meta));
      } else {
        dispatch(updateLane(data.new_val, meta));
      }
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        dispatch({type: CLEAR_LANES});
      }
    });
  };
}
