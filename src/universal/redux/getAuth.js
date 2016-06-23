import {cashay} from 'cashay';

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
       isNew,
       preferredName
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
  updateUserWithAuthToken(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      currentResponse.cachedUserAndToken = queryResponse;
      return currentResponse;
    }
  },
  updateUserProfile(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      Object.assign(currentResponse.cachedUserAndToken.user.profile, optimisticVariables.updatedProfile);
    }
    if (queryResponse) {
      Object.assign(currentResponse.cachedUserAndToken.user.profile, queryResponse.profile);
    }
    return currentResponse;
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
}
