import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddGitHubRepoPayload from 'server/graphql/types/AddGitHubRepoPayload';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {GITHUB} from 'universal/utils/constants';
import makeGitHubWebhookParams from 'server/utils/makeGitHubWebhookParams';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';

const createOrgWebhook = async (accessToken, nameWithOwner) => {
  const [owner] = nameWithOwner.split('/');
  const endpoint = `https://api.github.com/orgs/${owner}/hooks`;
  const webhooks = await fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}}).then((res) => res.json());
  // no need for an extra call to repositoryOwner to find out if its an org because personal or no access is handled the same
  if (Array.isArray(webhooks) && webhooks.length === 0) {
    const createHookParams = makeGitHubWebhookParams(['organization']);
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
    // get the user's token
    const provider = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: GITHUB, userId})
      .nth(0)
      .default(null);

    if (!provider || !provider.accessToken) {
      throw new Error('No GitHub Provider found! Try refreshing your token');
    }
    const {accessToken} = provider;
    const {data, errors} = await tokenCanAccessRepo(accessToken, nameWithOwner);

    if (errors) {
      console.error('GitHub error: ', errors);
      throw errors;
    }

    const isRepoAdmin = data.repository.viewerCanAdminister;
    if (!isRepoAdmin) {
      throw new Error(`You must be an administer of ${nameWithOwner} to integrate`);
    }

    // try to put other team members on this integration
    const allTeamProviders = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: GITHUB});

    const permissionArray = await Promise.all(allTeamProviders.map((prov) => {
      if (prov.userId === userId) return {};
      return tokenCanAccessRepo(prov.accessToken, nameWithOwner);
    }));
    const userIds = permissionArray.reduce((userIdArr, githubRes, idx) => {
      if (!githubRes.errors) {
        userIdArr.push(allTeamProviders[idx].userId);
      }
      return userIdArr;
    }, []);

    // RESOLUTION
    createOrgWebhook(accessToken, nameWithOwner);
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
              createdAt: now,
              updatedAt: now,
              isActive: true,
              nameWithOwner,
              teamId,
              userIds
            }, {returnChanges: true})('changes')(0)('new_val'),
          r.table(GITHUB)
            .get(integrationId)
            .update({
              isActive: true,
              userIds,
              updatedAt: now
            }, {returnChanges: true})('changes')(0)('new_val')
        );
      });

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
