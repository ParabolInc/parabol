export const getAuthQueryString = `
query {
  user @cached(type: "User") {
    email,
    id,
    nickname,
    picture,
    preferredName
  }
}`;

// we only want the preferredName, we know nothing else will change
const customMutations = {
  updateUserProfile: `
  mutation {
    updateUserProfile(updatedUser: $updatedUser) {
      preferredName
      id
    }
  }`
};

const updateTokenMutationHandlers = {
  updateUserProfile(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      Object.assign(currentResponse.user, optimisticVariables.updatedProfile);
    } else if (queryResponse) {
      Object.assign(currentResponse.user, queryResponse);
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

export const getAuthedOptions = (userId) => ({
  op: 'getAuthedUser',
  resolveCached: {user: () => userId},
  mutationHandlers: updateTokenMutationHandlers,
  customMutations
});
