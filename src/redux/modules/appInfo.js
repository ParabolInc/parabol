export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case 'SET_PATH_HELPERS':
      return {
        ...state,
        hostname: action.payload.hostname,
        port: action.payload.port
      };
    default:
      return state;
  }
}

export function addPathHelpers(hostname, port) {
  return {
    type: 'SET_PATH_HELPERS',
    payload: {
      hostname,
      port
    }
  };
}
