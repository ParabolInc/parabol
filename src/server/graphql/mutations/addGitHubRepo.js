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

    const [owner, name] = nameWithOwner.split('/');
    // see if the githubRepoId is legit
    const {accessToken} = provider;
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
    const {data, errors} = await ghProfile.json();
    if (errors) {
      console.error('GitHub error: ', errors);
      throw errors;
    }

    // RESOLUTION
    const newRepo = await r.table('GitHubIntegration')
      .insert({
        id: shortid.generate(),
        isActive: true,
        nameWithOwner,
        teamId,
        userIds: [userId]
      }, {returnChanges: true})('changes')(0)('new_val');
    const githubRepoAdded = {
      repo: newRepo
    };
    getPubSub().publish(`githubRepoAdded.${teamId}`, {githubRepoAdded, mutatorId: socket.id});
    return githubRepoAdded;
  }
};
