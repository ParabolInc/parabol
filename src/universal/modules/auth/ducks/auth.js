// import {push, replace} from 'react-router-redux';
// import {localStorageVars} from '../../../utils/clientOptions';
// // import {fromJS, Map as iMap} from 'immutable';
// import {fetchGraphQL} from '../../../utils/fetching';
//
// const {authTokenName} = localStorageVars;
//
// export const LOGIN_USER_REQUEST = 'LOGIN_USER_REQUEST';
// export const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR';
// export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
// export const LOGOUT_USER = 'LOGOUT_USER';
//
//
// // error will be held by cashay
// // isAuthenticated is true if user is an object
// // isAuthenticating is true if isComplete is false on a query for user stuff
// // authToken will come along for the ride
// // user will be a primary GraphQLType
//
//
// const initialState = iMap({
//   error: iMap(),
//   isAuthenticated: false,
//   isAuthenticating: false,
//   authToken: null,
//   user: null
// });
//
// export default function reducer(state = initialState, action = {}) {
//   switch (action.type) {
//
//     case LOGIN_USER_REQUEST:
//       return state.merge({
//         error: iMap(),
//         isAuthenticating: true
//       });
//     case LOGIN_USER_SUCCESS:
//       return state.merge({
//         error: iMap(),
//         isAuthenticating: false,
//         isAuthenticated: true,
//         authToken: action.payload.authToken,
//         user: fromJS(action.payload.profile)
//       });
//     case LOGIN_USER_ERROR:
//       return state.merge({
//         error: fromJS(action.error) || iMap(),
//         isAuthenticating: false,
//         isAuthenticated: false,
//         authToken: null,
//         user: iMap()
//       });
//     case LOGOUT_USER:
//       return initialState;
//     default:
//       return state;
//   }
// }
//
// export const loginUserSuccess = payload => ({
//   type: LOGIN_USER_SUCCESS,
//   payload
// });
//
// export const loginUserError = error => ({
//   type: LOGIN_USER_ERROR,
//   error
// });
//
// export const loginAndRedirect = (redirect, authToken) => {
//   const {profileName, authTokenName: tokenName} = localStorageVars;
//   localStorage.setItem(tokenName, authToken);
//   return async dispatch => {
//     const query = `
//     mutation ($authToken: String!) {
//       profile: updateUserWithIdToken(idToken: $authToken) {
//         id,
//         cachedAt,
//         cacheExpiresAt,
//         createdAt,
//         updatedAt,
//         userId,
//         email,
//         emailVerified,
//         picture,
//         name,
//         nickname,
//         identities {
//           connection,
//           userId,
//           provider,
//           isSocial,
//         }
//         loginsCount,
//         blockedFor {
//           identifier,
//           id,
//         }
//       }
//     }`;
//     const {error, data} = await fetchGraphQL({query, variables: {authToken}});
//     // TODO enable once we get the server credentials for good stuff
//     if (error) {
//       return dispatch({type: LOGIN_USER_ERROR, error});
//     }
//     const {profile} = data;
//     localStorage.setItem(profileName, JSON.stringify(profile));
//     dispatch(loginUserSuccess({profile, authToken}));
//     return dispatch(push(redirect));
//   };
// };
//
// export const logoutAndRedirect = () => {
//   localStorage.removeItem(authTokenName);
//   return (dispatch) => {
//     dispatch({type: LOGOUT_USER});
//     dispatch(replace('/'));
//   };
// };
