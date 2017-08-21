import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {GITHUB} from 'universal/utils/constants';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

const getCollabsOnPersonalRepos = async (personalRepos, providerUserName, accessToken) => {
  const integrationIdsToJoin = [];
  await Promise.all(personalRepos.map(async (repo) => {
    const {nameWithOwner} = repo;
    const endpoint = `https://api.github.com/repos/${nameWithOwner}/collaborators/${providerUserName}`;
    const res = await fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}});
    if (res.status === 204) {
      integrationIdsToJoin.push(repo.id);
    }
  }));
  return integrationIdsToJoin;
};

const getIntegrationIdsToJoin = async (integrations, accessToken, providerUserName) => {
  const permissionArray = await Promise.all(integrations.map((integration) => {
    return tokenCanAccessRepo(accessToken, integration.nameWithOwner);
  }));
  const orgRepoIds = [];
  const personalRepos = [];
  for (let i = 0; i < permissionArray.length; i++) {
    const githubRes = permissionArray[i];
    if (githubRes.errors) continue;
    const {__typename: repoType, viewerIsAMember} = githubRes.data.repository.owner;
    if (repoType === 'Organization' && viewerIsAMember) {
      orgRepoIds.push(integrations[i].id);
    } else {
      // this is a personal repo, where membership doesn't exist, so we need to see if they are a collaborator
      personalRepos.push(integrations[i]);
    }
  }
  const personalRepoIds = await getCollabsOnPersonalRepos(personalRepos, providerUserName, accessToken);
  return [...orgRepoIds, ...personalRepoIds];
};


// this is tricky logic, might as well make this handle an M:N for integrations & providers
const maybeJoinRepos = async (integrations, providers) => {
  if (integrations.length === 0 || providers.length === 0) return {};
  const r = getRethink();

  const maybeJoinReposForProvider = async (provider) => {
    const {accessToken, userId, providerUserName} = provider;
    const integrationIdArray = await getIntegrationIdsToJoin(integrations, accessToken, providerUserName);
    await r.table(GITHUB)
      .getAll(r.args(integrationIdArray), {index: 'id'})
      .update((doc) => ({
        userIds: doc('userIds').append(userId).distinct()
      }));
    return integrationIdArray.map((id) => toGlobalId(GITHUB, id));
  };

  return resolvePromiseObj(providers.reduce((obj, provider) => {
    obj[provider.userId] = maybeJoinReposForProvider(provider);
    return obj;
  }, {}));
};

export default maybeJoinRepos;

// TODO maybe use this later to be extra efficient
//const groupPrimitiveArraysByKey = (obj) => {
//  const keys = Object.keys(obj);
//  const usedKeys = new Set();
//  const groups = [];
//  for (let i = 0; i < keys.length; i++) {
//    if (usedKeys.has(i)) continue;
//    const key = keys[i];
//    const values = obj[key];
//    groups.push({
//      keys: [key],
//      values
//    });
//    for (let j = i + 1; j < keys.length; j++) {
//      if (usedKeys.has(j)) continue;
//      const nextKey = keys[j];
//      const nextValue = obj[nextKey];
//      if (primitiveArrayEqual(values, nextValue)) {
//        groups[groups.length - 1].keys.push(nextKey);
//        usedKeys.add(j);
//      }
//    }
//  }
//  return groups;
//};
//
