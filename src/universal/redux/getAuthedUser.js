export const getAuthQueryString = `
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
    },
    memberships {
      id,
      team {
       id,
       name
      },
      isLead,
      isActive,
      isFacilitator
    }
  }
}`;

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

export const authedOptions = {
  component: 'getAuthedUser',
  mutationHandlers: updateTokenMutationHandlers,
  localOnly: true
};
