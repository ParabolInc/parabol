import {cashay} from 'cashay';

const getAuthQueryString = `
query {
  user: getCurrentUser {
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
      currentResponse.user = queryResponse;
      return currentResponse;
    }
    return undefined;
  },
  updateUserProfile(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      Object.assign(currentResponse.user.profile, optimisticVariables.updatedProfile);
    } else if (queryResponse) {
      Object.assign(currentResponse.user.profile, queryResponse.profile);
    }
    return currentResponse;
  }
};

const authedOptions = {
  component: 'getAuthedUser',
  mutationHandlers: updateTokenMutationHandlers
};

const userThunk = () => cashay.query(getAuthQueryString, authedOptions).data.user;

let unsubscribe;
export default function getAuthedUser() {
  const {authToken} = cashay.store.getState();
  if (authToken) {
    if (!unsubscribe) {
      unsubscribe = cashay.store.subscribe(userThunk);
    }
    return userThunk();
  }
}
