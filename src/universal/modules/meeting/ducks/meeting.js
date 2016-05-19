import {Map as iMap, List as iList} from 'immutable';
import {push, replace} from 'react-router-redux'; // eslint-disable-line no-unused-vars
import {fetchGraphQL} from '../../../utils/fetching';
import {ensureState} from 'redux-optimistic-ui';
import {localStorageVars} from '../../../utils/clientOptions';
import socketCluster from 'socketcluster-client';
import emailAddresses from 'email-addresses';
import * as _ from 'lodash';

// Changed string consts because chances are we'll have more than 1 "CREATE_SUCCESS" down the road
export const CREATE_MEETING_REQUEST = 'action/meeting/CREATE_MEETING_REQUEST';
export const CREATE_MEETING_ERROR = 'action/meeting/CREATE_MEETING_ERROR';
export const CREATE_MEETING_SUCCESS = 'action/meeting/CREATE_MEETING_SUCCESS';
const SET_MEETING_ID = 'action/meeting/SET_MEETING_ID';
// TODO is a request necessary?
export const UPDATE_MEETING_REQUEST = 'action/meeting/UPDATE_MEETING_REQUEST';
export const UPDATE_MEETING_ERROR = 'action/meeting/UPDATE_MEETING_ERROR';
export const UPDATE_MEETING_SUCCESS = 'action/meeting/UPDATE_MEETING_SUCCESS';

export const UPDATE_MEETING_TEAM_NAME_SUCCESS = 'action/meeting/UPDATE_MEETING_TEAM_NAME_SUCCESS';


// TODO multiple meetings at once? It's possible with redux-operations
// making the switch to redux-operations now is cheap, later on it'll become a pain to switch

export const NAVIGATE_SETUP_0_GET_STARTED = 'action/meeting/NAVIGATE_SETUP_0_GET_STARTED';
export const NAVIGATE_SETUP_1_INVITE_TEAM = 'action/meeting/NAVIGATE_SETUP_1_INVITE_TEAM';
export const NAVIGATE_SETUP_2_INVITE_TEAM = 'action/meeting/NAVIGATE_SETUP_2_INVITE_TEAM';

// UI State
export const UPDATE_SHORTCUT_MENU_STATE = 'action/meeting/UPDATE_SHORTCUT_MENU_STATE';

// Setup 1
export const SETUP1_ADD_EMAILS_SUCCESS = 'action/meeting/SETUP1_ADD_EMAILS_SUCCESS';
export const SETUP1_ADD_EMAILS_ERROR = 'action/meeting/SETUP1_ADD_EMAILS_ERROR';
export const SETUP1_UPDATE_INVITES_FIELD = 'action/meeting/SETUP1_UPDATE_INVITES_FIELD';

// Setup 2
export const SETUP2_REMOVE_INVITEE = 'action/meeting/SETUP2_REMOVE_INVITEE';

const initialState = iMap({
  isLoading: false,
  isLoaded: false,
  instance: iMap({
    id: '',
    content: '',
    team: iMap({  // TODO: make me actually link to nested team object
      name: ''
    }),
    lastUpdatedBy: '',
    currentEditors: iList()
  }),
  navigation: NAVIGATE_SETUP_0_GET_STARTED,
  uiState: iMap({
    hasOpenShortcutMenu: false,
    setup1: iMap({
      emails: iList(),
      invitesField: '',
      invitesFieldError: ''
    })
  })
});

// TODO: Scrub this code, not used?
// const remove = (list, idx) => [
//   ...list.slice(0, idx),
//   ...list.slice(idx + 1)
// ];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_MEETING_ID:
      return state.mergeDeep({
        instance: iMap({
          id: action.payload.id
        })
      });
    case CREATE_MEETING_REQUEST:
      return state.merge({
        isLoading: true
      });
    case CREATE_MEETING_SUCCESS:
      return state.mergeDeep({
        isLoading: false,
        isLoaded: true,
        instance: iMap({
          id: action.payload.id
        })
      });
    case CREATE_MEETING_ERROR:
    case UPDATE_MEETING_ERROR:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case UPDATE_MEETING_SUCCESS:
      return state.mergeDeep({
        instance: iMap(action.payload)
      });
    case UPDATE_MEETING_TEAM_NAME_SUCCESS:
      return state.mergeDeep({
        instance: iMap({
          team: iMap({
            name: action.payload.team.name
          }),
          lastUpdatedBy: action.payload.updatedBy
        })
      });
    case UPDATE_SHORTCUT_MENU_STATE:
      return state.merge({
        uiState: iMap({
          hasOpenShortcutMenu: action.payload.boolean
        })
      });
    case NAVIGATE_SETUP_0_GET_STARTED:
      return state.merge({
        navigation: NAVIGATE_SETUP_0_GET_STARTED
      });
    case NAVIGATE_SETUP_1_INVITE_TEAM:
      return state.merge({
        navigation: NAVIGATE_SETUP_1_INVITE_TEAM
      });
    case NAVIGATE_SETUP_2_INVITE_TEAM:
      return state.merge({
        navigation: NAVIGATE_SETUP_2_INVITE_TEAM
      });
    case SETUP1_ADD_EMAILS_ERROR:
      return state.mergeDeep({
        uiState: iMap({
          setup1: iMap({
            invitesFieldError: 'invalid email addresses'
          })
        })
      });
    case SETUP1_ADD_EMAILS_SUCCESS:
      return state.mergeDeep({
        uiState: iMap({
          setup1: iMap({
            emails: iList(action.payload),
            invitesField: '',
            invitesFieldError: ''
          })
        })
      });
    case SETUP1_UPDATE_INVITES_FIELD:
      return state.mergeDeep({
        uiState: iMap({
          setup1: iMap({
            invitesField: action.payload,
            invitesFieldError: ''
          })
        })
      });
    case SETUP2_REMOVE_INVITEE: {
      const idx = action.payload;
      const list = state.getIn(['uiState', 'setup1', 'emails']);
      return state.mergeDeep({
        uiState: iMap({
          setup1: iMap({
            emails: [
              ...list.slice(0, idx),
              ...list.slice(idx + 1)
            ]
          })
        })
      });
    }
    default:
      return state;
  }
}

export const setMeetingId = meetingId => ({
  type: SET_MEETING_ID,
  payload: {id: meetingId}
});

export const createMeetingAndRedirect = () =>
  async (dispatch, getState) => {
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
    // replace, don't use push. a click should go back 2.
    return dispatch(replace(`/meeting/${id}`));
  };

const updateMeetingSuccess = (payload, meta) => ({
  type: UPDATE_MEETING_SUCCESS,
  payload,
  meta
});

export const loadMeeting = meetingId => {
  const sub = `getMeeting/${meetingId}`;
  const {authTokenName} = localStorageVars;
  const socket = socketCluster.connect({authTokenName});
  socket.subscribe(sub, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      dispatch({
        type: UPDATE_MEETING_SUCCESS,
        payload: data,
        meta: {synced: true}
      });
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        console.log(`unsubbed from ${channelName}`);
      }
    });
  };
};

export const updateEditing = (meetingId, editor, isEditing) => {
  if (!editor) {
    // can remove
    console.log('updateEditing has no editor');
  }
  return async dispatch => {
    const mutation = isEditing ? 'editContent' : 'finishEditContent';
    const query = `
      mutation($meetingId: ID!, $editor: String!) {
        payload: ${mutation}(meetingId: $meetingId, editor: $editor) {
          id,
          currentEditors
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {meetingId, editor}});
    if (error) {
      return dispatch({type: UPDATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    return dispatch(updateMeetingSuccess(payload));
  };
};

export const updateContent = (meetingId, content, updatedBy) =>
  async dispatch => {
    const query = `
      mutation($meetingId: ID!, $content: String!, $updatedBy: String!) {
        payload: updateContent(meetingId: $meetingId, content: $content, updatedBy: $updatedBy) {
          id,
          content,
          lastUpdatedBy
        }
      }`;
    const {error, data} = await fetchGraphQL({query, variables: {meetingId, content, updatedBy}});
    if (error) {
      return dispatch({type: UPDATE_MEETING_ERROR, error});
    }
    const {payload} = data;
    return dispatch(updateMeetingSuccess(payload));
  };

const updateMeetingTeamNameSuccess = (payload, meta) => ({
  type: UPDATE_MEETING_TEAM_NAME_SUCCESS,
  payload,
  meta
});

// TODO: make me actually interact with GraphQL
export const updateMeetingTeamName = (name, updatedBy) =>
  async dispatch => {
    const payload = {
      team: {
        name
      },
      updatedBy
    };
    return dispatch(updateMeetingTeamNameSuccess(payload));
  };

export const addInvitesFromInvitesField = (emailsString) => {
  let emails = emailAddresses.parseAddressList(emailsString);
  if (emails === null) {
    return ({
      type: SETUP1_ADD_EMAILS_ERROR,
      payload: null
    });
  }
  emails = _.map(emails, (em) => _.pick(em, ['name', 'address']));
  return ({
    type: SETUP1_ADD_EMAILS_SUCCESS,
    payload: emails
  });
};

export const updateInvitesField = (value) => ({
  type: SETUP1_UPDATE_INVITES_FIELD,
  payload: value
});

export const removeInvitee = (nameOrEmail) =>
  (dispatch, getState) => {
    const idx = getState()
      .getIn(['meeting', 'uiState', 'setup1', 'emails'])
      .findIndex((em) => em.name === nameOrEmail || em.address === nameOrEmail);
    return dispatch({
      type: SETUP2_REMOVE_INVITEE,
      payload: idx
    });
  };
