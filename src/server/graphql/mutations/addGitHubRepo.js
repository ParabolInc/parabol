import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddGitHubRepoPayload from 'server/graphql/types/AddGitHubRepoPayload';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import makeGitHubWebhookParams from 'server/utils/makeGitHubWebhookParams';
import shortid from 'shortid';
import {GITHUB, GITHUB_ENDPOINT} from 'universal/utils/constants';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos';

const createRepoWebhook = async (accessToken, nameWithOwner, publicKey) => {
  const endpoint = `https://api.github.com/repos/${nameWithOwner}/hooks`;
  const res = await fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}});
  const webhooks = await res.json();
  // no need for an extra call to repositoryOwner to find out if its an org because personal or no access is handled the same
  if (Array.isArray(webhooks) && webhooks.length === 0) {
    const createHookParams = makeGitHubWebhookParams(publicKey, [
      'issues',
      'issue_comment',
      'label',
      'member',
      'milestone',
      'pull_request',
      'pull_request_review',
      'repository'
    ]);
    fetch(endpoint, makeGitHubPostOptions(accessToken, createHookParams));
  }
};

const getOrgQuery = `
query getOrg($login: String!) {
  organization(login: $login) {
    databaseId
  }
}`;

const createOrgWebhook = async (accessToken, nameWithOwner) => {
  const [owner] = nameWithOwner.split('/');
  const endpoint = `https://api.github.com/orgs/${owner}/hooks`;
  const res = await fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}});
  const webhooks = await res.json();
  // no need for an extra call to repositoryOwner to find out if its an org because personal or no access is handled the same
  if (Array.isArray(webhooks) && webhooks.length === 0) {
    const authedPostOptions = makeGitHubPostOptions(accessToken, {
      query: getOrgQuery,
      variables: {login: owner}
    });
    const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
    const profileRes = await ghProfile.json();
    if (profileRes.errors) {
      throw profileRes.errors;
    }
    const {data: {organization: {databaseId}}} = profileRes;
    const publickKey = String(databaseId);
    const createHookParams = makeGitHubWebhookParams(publickKey, ['organization']);
    fetch(endpoint, makeGitHubPostOptions(accessToken, createHookParams));
  }
};

export default {
  name: 'AddGitHubRepo',
  type: new GraphQLNonNull(AddGitHubRepoPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async (source, {teamId, nameWithOwner}, {authToken, socket}) => {
    const r = getRethink();
    const now = new Date();
    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);
    const userId = getUserId(authToken);

    // VALIDATION
    const allTeamProviders = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: GITHUB});

    const viewerProviderIdx = allTeamProviders.findIndex((provider) => provider.userId === userId);
    if (viewerProviderIdx === -1) {
      throw new Error('No GitHub Provider found! Try refreshing your token');
    }
    // first check if the viewer has permission. then, check the rest
    const {accessToken} = allTeamProviders[viewerProviderIdx];
    const viewerPermissions = await tokenCanAccessRepo(accessToken, nameWithOwner);
    const {data, errors} = viewerPermissions;
    if (errors) {
      console.error('GitHub error: ', errors);
      throw errors;
    }

    const {repository: {viewerCanAdminister, databaseId: ghRepoId}} = data;
    if (!viewerCanAdminister) {
      throw new Error(`You must be an administer of ${nameWithOwner} to integrate`);
    }

    // RESOLUTION

    // add the webhooks on GitHub
    createRepoWebhook(accessToken, nameWithOwner, String(ghRepoId));
    createOrgWebhook(accessToken, nameWithOwner);

    // create or rehydrate the integration
    const newRepo = await r.table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({nameWithOwner})
      .nth(0)('id')
      .default(null)
      .do((integrationId) => {
        return r.branch(
          integrationId.eq(null),
          r.table(GITHUB)
            .insert({
              id: shortid.generate(),
              adminUserId: userId,
              createdAt: now,
              updatedAt: now,
              isActive: true,
              nameWithOwner,
              teamId,
              userIds: [userId]
            }, {returnChanges: true})('changes')(0)('new_val'),
          r.table(GITHUB)
            .get(integrationId)
            .update({
              adminUserId: userId,
              isActive: true,
              userIds: [userId],
              updatedAt: now
            }, {returnChanges: true})('changes')(0)('new_val')
        );
      });

    // get a list of everyone else on the team that can join
    const teamMemberProviders = allTeamProviders.slice().splice(viewerProviderIdx, 1);
    const usersAndIntegrations = await maybeJoinRepos([newRepo], teamMemberProviders);
    const userIds = Object.keys(usersAndIntegrations);
    // doing this fetch here, before we publish to the pubsub, means we don't need to do it once per sub
    newRepo.users = await r.table('User')
      .getAll(r.args(userIds), {index: 'id'})
      .pluck('preferredName', 'picture', 'id');

    const githubRepoAdded = {
      repo: newRepo
    };
    getPubSub().publish(`githubRepoAdded.${teamId}`, {githubRepoAdded, mutatorId: socket.id});


    // set up webhooks
    // const createHookParams = {
    //  name: 'web',
    //  config: {
    //    url: makeAppLink('webhooks/github'),
    //    content_type: 'json',
    //    //secret:
    //  },
    //  events: ["assigned", "unassigned", "labeled", "unlabeled", "opened", "edited", "milestoned", "demilestoned", "closed", "reopened"],
    //  active: true
    // };
    return githubRepoAdded;
  }
};
