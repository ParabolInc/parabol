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
      profile {
       welcomeSentAt,
       isNew
      }
    }
  }
}`;

// memberships {
//   id,
//     teamId,
//     active,
//     isLead,
//     isFacilitator,
//     cachedUserId,
//     inviteId,
//     name,
//     email
// }
const updateTokenMutationHandlers = {
  updateUserWithAuthToken(optimisticVariables, dataFromServer, currentResponse) {
    if (dataFromServer) {
      currentResponse.cachedUserAndToken = dataFromServer.updateUserWithAuthToken;
      return currentResponse;
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

export default function getAuth() {
  return cashay.query(getAuthQueryString, loginWithTokenOptions).data.cachedUserAndToken;
};
