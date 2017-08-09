import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos';
import getProviderRowData from 'server/safeQueries/getProviderRowData';
import postOptions from 'server/utils/fetchOptions';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {GITHUB, GITHUB_ENDPOINT, GITHUB_SCOPE} from 'universal/utils/constants';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';

const profileQuery = `
query { 
  viewer { 
    login
    id
    organizations(first: 100) {
      nodes {
        login
        viewerCanAdminister
      }
    }
  }
}`;

const getJoinedIntegrationIds = async (integrationCount, accessToken, teamId, userId) => {
  if (integrationCount === 0) return [];
  const r = getRethink();
  const allIntegrations = await r.table(GITHUB)
    .getAll(teamId, {index: 'teamId'})
    .filter({isActive: true});
  return maybeJoinRepos(allIntegrations, accessToken, userId);
};

const getTeamMember = async (joinedIntegrationIds, teamMemberId) => {
  if (joinedIntegrationIds.length > 0) {
    const r = getRethink();
    return r.table('TeamMember').get(teamMemberId).pluck('id', 'preferredName', 'picture');
  }
  return undefined;
};

const addProviderGitHub = async (code, teamId, userId) => {
  const r = getRethink();
  const now = new Date();
  const queryParams = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code
    // redirect_uri: makeAppLink('auth/github/entry')
  };
  const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`;
  const ghRes = await fetch(uri, postOptions);
  const json = await ghRes.json();
  const {access_token: accessToken, error, scope} = json;
  if (error) {
    throw new Error(`GitHub: ${error}`);
  }
  if (scope !== GITHUB_SCOPE) {
    throw new Error(`bad scope: ${scope}`);
  }
  const authedPostOptions = makeGitHubPostOptions(accessToken, {
    query: profileQuery
  });
  const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
  const gqlRes = await ghProfile.json();
  if (!gqlRes.data) {
    console.error('GitHub error: ', gqlRes);
  }
  const {data: {viewer: {login}}} = gqlRes;
  const provider = await r.table('Provider')
    .getAll(teamId, {index: 'teamIds'})
    .filter({service: GITHUB, userId})
    .nth(0)('id')
    .default(null)
    .do((providerId) => {
      return r.branch(
        providerId.eq(null),
        r.table('Provider')
          .insert({
            id: shortid.generate(),
            accessToken,
            createdAt: now,
            // github userId is never used for queries, but the login is!
            providerUserId: login,
            providerUserName: login,
            service: GITHUB,
            teamIds: [teamId],
            updatedAt: now,
            userId
          }, {returnChanges: true})('changes')(0)('new_val'),
        r.table('Provider')
          .get(providerId)
          .update({
            accessToken,
            updatedAt: now,
            providerUserId: login,
            providerUserName: login
          }, {returnChanges: true})('changes')(0)('new_val')
      );
    });

  const rowDetails = await getProviderRowData(GITHUB, teamId);
  const joinedIntegrationIds = await getJoinedIntegrationIds(rowDetails.integrationCount, accessToken, teamId, userId);
  const teamMemberId = `${userId}::${teamId}`;
  const teamMember = await getTeamMember(joinedIntegrationIds, teamMemberId);
  const providerAdded = {
    provider,
    providerRow: {
      ...rowDetails,
      accessToken,
      service: GITHUB,
      // tell relay to not automatically merge the new value as a sink. changed teamId changes globalId
      teamId: `_${teamId}`
    },
    joinedIntegrationIds,
    teamMember
  };

  getPubSub().publish(`providerAdded.${teamId}`, {providerAdded});
};

export default addProviderGitHub;
