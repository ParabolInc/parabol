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

const getJoinedIntegrationIds = async (teamId, provider, integrationCount, isUpdate) => {
  if (integrationCount === 0 || isUpdate) return [];
  const r = getRethink();
  const integrationsToJoin = await r.table(GITHUB)
    .getAll(teamId, {index: 'teamId'})
    .filter({isActive: true});
  const userIntegrations = await maybeJoinRepos(integrationsToJoin, [provider]);
  const {userId} = provider;
  return userIntegrations[userId];
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
  const {data: {viewer: {login: providerUserName}}} = gqlRes;
  const providerChange = await r.table('Provider')
    .getAll(teamId, {index: 'teamId'})
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
            isActive: true,
            // github userId is never used for queries, but the login is!
            providerUserId: providerUserName,
            providerUserName,
            service: GITHUB,
            teamId,
            updatedAt: now,
            userId
          }, {returnChanges: true})('changes')(0),
        r.table('Provider')
          .get(providerId)
          .update({
            accessToken,
            isActive: true,
            updatedAt: now,
            providerUserId: providerUserName,
            providerUserName
          }, {returnChanges: true})('changes')(0)
      );
    });
  const provider = providerChange.new_val;

  const rowDetails = await getProviderRowData(GITHUB, teamId);
  const isUpdate = providerChange.old_val.isActive;
  const joinedIntegrationIds = await getJoinedIntegrationIds(teamId, provider, rowDetails.integrationCount, isUpdate);
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
