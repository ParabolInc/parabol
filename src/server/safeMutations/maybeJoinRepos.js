import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {GITHUB} from 'universal/utils/constants';
import {toGlobalId} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';

const maybeJoinRepos = async (integrations, accessToken, userId) => {
  const r = getRethink();
  const permissionPromises = integrations.map((integration) => {
    return tokenCanAccessRepo(accessToken, integration.nameWithOwner);
  });
  const permissionArray = await Promise.all(permissionPromises);
  const integrationIdsToJoin = permissionArray.reduce((integrationArr, githubRes, idx) => {
    if (!githubRes.errors) {
      integrationArr.push(integrations[idx].id);
    }
    return integrationArr;
  }, []);
  await r.table(GITHUB)
    .getAll(r.args(integrationIdsToJoin), {index: 'id'})
    .update((doc) => ({
      userIds: doc('userIds').append(userId).distinct()
    }));
  return integrationIdsToJoin.map((id) => toGlobalId(GITHUB, id));
};

export default maybeJoinRepos;