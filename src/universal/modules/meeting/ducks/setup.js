import {Map as iMap, List as iList} from 'immutable';
import emailAddresses from 'email-addresses';
import * as _ from 'lodash';
import {fetchGraphQL} from '../../../utils/fetching';


// Setup 1
export const SETUP1_ADD_EMAILS_SUCCESS = 'action/meeting/SETUP1_ADD_EMAILS_SUCCESS';
export const SETUP1_ADD_EMAILS_ERROR = 'action/meeting/SETUP1_ADD_EMAILS_ERROR';
export const SETUP1_UPDATE_INVITES_FIELD = 'action/meeting/SETUP1_UPDATE_INVITES_FIELD';

// Setup 2
export const SETUP2_REMOVE_INVITEE = 'action/meeting/SETUP2_REMOVE_INVITEE';
export const SETUP2_UPDATE_ROW_HOVER = 'action/meeting/SETUP2_UPDATE_ROW_HOVER';
export const SETUP2_INVITES_ERROR = 'action/meeting/SETUP2_INVITES_ERROR';
export const SETUP2_INVITES_SUCCESS = 'action/meeting/SETUP2_INVITES_SUCCESS';

const initialState = iMap({
  setup1: iMap({
    emails: iList(),
    invitesField: '',
    invitesFieldHasValue: false,
    invitesFieldError: '',
    invitesFieldHasError: false
  }),
  setup2: iMap({
    rowWithHover: ''
  })
});

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SETUP1_ADD_EMAILS_ERROR:
      return state.mergeDeep({
        setup1: iMap({
          invitesFieldError: 'invalid email addresses',
          invitesFieldHasError: true
        })
      });
    case SETUP1_ADD_EMAILS_SUCCESS:
      return state.mergeDeep({
        setup1: iMap({
          emails: iList(action.payload),
          invitesField: '',
          invitesFieldHasValue: false,
          invitesFieldError: '',
          invitesFieldHasError: false
        })
      });
    case SETUP1_UPDATE_INVITES_FIELD:
      return state.mergeDeep({
        setup1: iMap({
          invitesField: action.payload.value,
          invitesFieldHasValue: action.payload.hasValue,
          invitesFieldError: '',
          invitesFieldHasError: false
        })
      });
    case SETUP2_REMOVE_INVITEE: {
      const idx = action.payload;
      const list = state.getIn(['setup1', 'emails']);
      return state.mergeDeep({
        setup1: iMap({
          emails: [
            ...list.slice(0, idx),
            ...list.slice(idx + 1)
          ]
        })
      });
    }
    case SETUP2_UPDATE_ROW_HOVER:
      return state.mergeDeep({
        setup2: iMap({
          rowWithHover: action.payload
        })
      });
    default:
      return state;
  }
}

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

export const updateInvitesField = (value) => {
  let hasValue = true;
  if (value === '') {
    hasValue = false;
  }
  return ({
    type: SETUP1_UPDATE_INVITES_FIELD,
    payload: {
      value,
      hasValue
    }
  });
};

export const removeInvitee = (nameOrEmail) =>
  (dispatch, getState) => {
    const idx = getState()
      .getIn(['meetingModule', 'setup', 'setup1', 'emails'])
      .findIndex((em) => em.name === nameOrEmail || em.address === nameOrEmail);
    return dispatch({
      type: SETUP2_REMOVE_INVITEE,
      payload: idx
    });
  };

// TODO: batch this query?
export const createInvites = (teamId) =>
  async (dispatch, getState) => {
    const queries = [];
    const invitees = getState()
      .getIn(['meetingModule', 'setup', 'setup1', 'emails']);
    for (const invitee of invitees) {
      const {address} = invitee;
      const name = invitee.name || '';
      const query = `
        mutation($teamId: ID!, $name: String!, $email: String!) {
          payload: createTeamMember(teamId: $teamId, name: $name, email: $email) {
            id,
            name,
            email
          }
        }`;
      queries.push(
        fetchGraphQL({query, variables: {teamId, name, email: address}})
      );
    }
    const results = await Promise.all(queries);
    const error = _.reduce(
      results,
      (agg, result) => (agg || result.error),
      false
    );
    if (error) {
      return dispatch({ type: SETUP2_INVITES_ERROR });
    }
    return dispatch({ type: SETUP2_INVITES_SUCCESS });
  };
