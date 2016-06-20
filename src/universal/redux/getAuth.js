import {cashay} from 'cashay';
import jwtDecode from 'jwt-decode';

const getAuthQueryString = `
query {
  cachedUserAndToken: getUserWithAuthToken(authToken: $authToken) {
    authToken,
    user {
      id,
      cachedAt,
      cacheExpiresAt,
      createdAt,
      updatedAt,
      email,
      emailVerified,
      picture,
      name,
      nickname,
      identities {
        connection,
        userId,
        provider,
        isSocial,
      }
      loginsCount,
      blockedFor {
        identifier,
        id,
      },
    }
  }
}`;

// userProfile {
//   emailWelcomed
// }

const updateTokenMutationHandlers = {
  updateUserWithAuthToken(optimisticVariables, dataFromServer, currentResponse) {
    if (dataFromServer) {
      currentResponse.cachedUserAndToken = dataFromServer.updateUserWithAuthToken;
      return currentResponse;
    } else {
      const {authToken} = currentResponse.cachedUserAndToken;
      if (authToken) {
        const authTokenObj = jwtDecode(authToken);
        if (authTokenObj.exp < Date.now() / 1000) {
          currentResponse.cachedUserAndToken.authToken = null;
          return currentResponse;
        }
      }
    }
  }
};

const loginWithTokenOptions = {
  component: 'getAuth',
  variables: {
    authToken: response => response.cachedUserAndToken.authToken
  },
  mutationHandlers: updateTokenMutationHandlers
};

export default function getAuth(clearBadToken) {
  const response = cashay.query(getAuthQueryString, loginWithTokenOptions);
  if (clearBadToken) {
    // mutates response.data.cachedUserAndToken.authToken if it's no good
    cashay.mutate('updateUserWithAuthToken', {localOnly: true});
  }
  return response.data.cachedUserAndToken;

};
