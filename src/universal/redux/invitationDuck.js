/**
 * Actions and reducer for invitation token state.
 *
 * @flow
 */
const SET_INVITE_TOKEN = '@@invitation/SET_INVITE_TOKEN';
const UNSET_INVITE_TOKEN = '@@invitation/UNSET_INVITE_TOKEN';

export const DEFAULT_INVITATION_REDUCER_NAME = 'invitation';

type Action = {
  type:
    | '@@invitation/SET_INVITE_TOKEN'
    | '@@invitation/UNSET_INVITE_TOKEN',
  payload: Object
};

type State = {
  inviteToken: ?string
};

const initialState: State = {
  inviteToken: null
};

export default function reducer(state: State = initialState, action: Action): State {
  const {type} = action;
  switch (type) {
    case SET_INVITE_TOKEN: {
      const {inviteToken} = action.payload;
      return {inviteToken};
    }
    case UNSET_INVITE_TOKEN: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}

export const setInviteToken = (inviteToken: string): Action => ({
  type: SET_INVITE_TOKEN,
  payload: {inviteToken}
});

export const unSetInviteToken = (): Action => ({
  type: UNSET_INVITE_TOKEN,
  payload: {}
});
