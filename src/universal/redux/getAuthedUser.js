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
      meeting {
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
  acceptInvitation(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      // we can't be optimistic, server must process our invite token:
      currentResponse.user.memberships.push(queryResponse);
    }
    return undefined;
  },
  createMeeting(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      const {leader, id, name, isActive, isLead, isFacilitator} = optimisticVariables.newMeeting;
      const membership = {
        id: leader.id,
        meeting: {id, name},
        isActive,
        isLead,
        isFacilitator
      };
      currentResponse.user.memberships.push(membership);
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
  },
  updateUserWithAuthToken(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      currentResponse.user = queryResponse;
      return currentResponse;
    }
    return undefined;
  },
};

export const authedOptions = {
  component: 'getAuthedUser',
  mutationHandlers: updateTokenMutationHandlers,
  localOnly: true
};
