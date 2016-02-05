export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case 'SET_PATH_HELPERS':
      return {
        ...state,
        hostname: action.hostname,
        port: action.port
      };
    default:
      return state;
  }
}

export function addPathHelpers(hostname, port) {
  return {
    type: 'SET_PATH_HELPERS',
    hostname,
    port
  };
}
