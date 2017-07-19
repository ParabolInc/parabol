import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddGitHubRepoPayload from 'server/graphql/types/AddGitHubRepoPayload';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {GITHUB, GITHUB_ENDPOINT} from 'universal/utils/constants';

const getRepoQuery = `
query getRepo($name: String! $owner: String!) {
  repository(name: $name, owner: $owner) {
    nameWithOwner
  }
}`;

const tokenCanAccessRepo = async (accessToken, nameWithOwner) => {
  const [owner, name] = nameWithOwner.split('/');
  // see if the githubRepoId is legit
  const authedPostOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      query: getRepoQuery,
      variables: {name, owner}
    })
  };
  const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
  return ghProfile.json();
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
    const {errors} = await tokenCanAccessRepo(accessToken, nameWithOwner);

    if (errors) {
      console.error('GitHub error: ', errors);
      throw errors;
    }

    // try to put other team members on this integration
    const allTeamProviders = await r.table('Provider')
      .getAll(teamId, {index: 'teamIds'})
      .filter({service: GITHUB});

    const permissionPromises = allTeamProviders.map((prov) => {
      if (prov.userId === userId) return {};
      return tokenCanAccessRepo(prov.accessToken, nameWithOwner);
    });
    const permissionArray = await Promise.all(permissionPromises);
    const userIds = permissionArray.reduce((userIdArr, prov, idx) => {
      if (!permissionArray.errors) {
        userIdArr.push(allTeamProviders[idx].userId);
        return userIdArr;
      }
    }, []);

    // RESOLUTION
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

    return githubRepoAdded;
  }
};
