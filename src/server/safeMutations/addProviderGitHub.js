import {toGlobalId} from 'graphql-relay';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
import getRethink from 'server/database/rethinkDriver';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import getProviderRowData from 'server/safeQueries/getProviderRowData';
import postOptions from 'server/utils/fetchOptions';
import getPubSub from 'server/utils/getPubSub';
import makeAppLink from 'server/utils/makeAppLink';
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
  const r = getRethink();
  if (integrationCount > 0) {
    const allIntegrations = await r.table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true});
    const permissionPromises = allIntegrations.map((integration) => {
      return tokenCanAccessRepo(accessToken, integration.nameWithOwner);
    });
    const permissionArray = await Promise.all(permissionPromises);
    const integrationIdsToJoin = permissionArray.reduce((integrationArr, githubRes, idx) => {
      if (!githubRes.errors) {
        integrationArr.push(allIntegrations[idx].id);
      }
      return integrationArr;
    }, []);
    await r.table(GITHUB)
      .getAll(r.args(integrationIdsToJoin), {index: 'id'})
      .update((doc) => ({
        userIds: doc('userIds').append(userId).distinct()
      }));
    return integrationIdsToJoin.map((id) => toGlobalId(GITHUB, id));
  }
  return [];
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
    code,
    redirect_uri: makeAppLink('auth/github')
  };
  const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`;
  const ghRes = await fetch(uri, postOptions);
  const json = await ghRes.json();
  const {access_token: accessToken, scope} = json;
  if (scope !== GITHUB_SCOPE) {
    throw new Error(`bad scope: ${scope}`);
  }
  const authedPostOptions = makeGitHubPostOptions(accessToken, {
    query: profileQuery
  })
  const ghProfile = await fetch(GITHUB_ENDPOINT, authedPostOptions);
  const gqlRes = await ghProfile.json();
  if (!gqlRes.data) {
    console.error('GitHub error: ', gqlRes);
  }
  const {data: {viewer: {login: providerUserName, id: providerUserId, organizations}}} = gqlRes;
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
            providerUserId,
            providerUserName,
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
            providerUserId,
            providerUserName
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

  const orgsWithAdminRights = organizations.nodes.filter((org) => org.viewerCanAdminister);
  // for each org, see if the webhook already exists
  // if it does, go on to next
  // if it does not, create it

  const webhookLists = await Promise.all(orgsWithAdminRights.map((org) => {
    const endpoint = `https://api.github.com/orgs/${org.login}/hooks`;
    return fetch(endpoint, {headers: {Authorization: `Bearer ${accessToken}`}});
  }));
  const createHookParams = {
    name: 'web',
    config: {
      url: makeAppLink('webhooks/github'),
      content_type: 'json',
      //secret:
    },
    events: ['member_added', 'member_removed'],
    active: true
  };
  const promises = webhookLists.map((hookList, idx) => {
    if (hookList.length > 0) return undefined;
    const org = orgsWithAdminRights[idx];
    const endpoint = `https://api.github.com/orgs/${org.login}/hooks`;
    return fetch(endpoint, makeGitHubPostOptions(accessToken, createHookParams))
      .then((res) => {
        console.log('res', res);
        return res.json();
      })
      .then((resJson) => {
        console.log('json', resJson)
      })
  });

  const allRes = await Promise.all(promises);
  console.log('promises', allRes);
  // if only the admin can do this, it kinda loses the priority
  // add the webhooks, only works if the request is from an org admin

  //

  getPubSub().publish(`providerAdded.${teamId}`, {providerAdded});
};

export default addProviderGitHub;
