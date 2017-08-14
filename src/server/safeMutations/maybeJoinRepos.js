import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {GITHUB} from 'universal/utils/constants';

const getCollabsOnPersonalRepos = async (personalRepos, providerUserName, accessToken) => {
  const integrationIdsToJoin = [];
  await Promise.all(personalRepos.map(async (repo) => {
    const {nameWithOwner} = repo;
    const endpoint = `https://api.github.com/repos/${nameWithOwner}/collaborators/${providerUserName}`;
    const res = await fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}});
    console.log('status', res.status, typeof res.status)
    if (res.status === 204) {
      integrationIdsToJoin.push(repo.id);
    }
  }));
  return integrationIdsToJoin;
}
const maybeJoinRepos = async (integrations, accessToken, userId, providerUserName) => {
  const r = getRethink();
  const permissionPromises = integrations.map((integration) => {
    return tokenCanAccessRepo(accessToken, integration.nameWithOwner);
  });
  const permissionArray = await Promise.all(permissionPromises);
  const orgRepoIds = [];
  const personalRepos = [];
  for (let i = 0; i < permissionArray.length; i++) {
    const githubRes = permissionArray[i];
    if (githubRes.errors) continue;
    const repoType = githubRes.data.repository.owner.__typename;
    if (repoType === 'Organization') {
      orgRepoIds.push(integrations[i].id);
    } else {
      // this is a personal repo, where membership doesn't exist, so we need to see if they are a collaborator
      personalRepos.push(integrations[i]);
    }
  }
  const personalRepoIds = await getCollabsOnPersonalRepos(personalRepos, providerUserName, accessToken);
  const integrationIdsToJoin = [...orgRepoIds, ...personalRepoIds];

  await r.table(GITHUB)
    .getAll(r.args(integrationIdsToJoin), {index: 'id'})
    .update((doc) => ({
      userIds: doc('userIds').append(userId).distinct()
    }));
  return integrationIdsToJoin.map((id) => toGlobalId(GITHUB, id));
};

export default maybeJoinRepos;
