const UPDATE_APP_URL = 'appInfo/UPDATE_APP_URL';

const initialState = {
  url: ''
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_APP_URL:
      return {
        ...state,
        url: action.payload.url
      };
    default:
      return state;
  }
}

export function updateAppUrl(url) {
  return {
    type: UPDATE_APP_URL,
    payload: {
      url
    }
  };
}
